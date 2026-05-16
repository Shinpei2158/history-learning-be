import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { StudentAchievement, StudentAchievementDocument } from '@/achievement/schemas/student-achivement.schema';
import { Achievement, AchievementDocument } from '@/achievement/schemas/achievement.schema';
import { Avatar, AvatarDocument } from '@/users/schemas/avatar.schema';
import { Frame, FrameDocument } from '@/users/schemas/frame.schema';
import { UserItem, UserItemDocument } from '@/users/schemas/user-item.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    @InjectModel(StudentAchievement.name) private studentAchievementModel: Model<StudentAchievementDocument>,
    @InjectModel(Avatar.name) private avatarModel: Model<AvatarDocument>,
    @InjectModel(Frame.name) private frameModel: Model<FrameDocument>,
    @InjectModel(UserItem.name) private userItemModel: Model<UserItemDocument>
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async getMe(user: any) {
    const foundUser = await (await (
      await this.usersService.findOne(user.sub)
    )
      .populate('avatar'))
      .populate('frame');

    return {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
      fullName: foundUser.fullName,
      role: foundUser.role,
      avatar: foundUser.avatar,
      frame: foundUser.frame,
      point: foundUser.point,
      exp: foundUser.exp,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const emailVerificationToken = uuidv4();

    // Lấy danh sách avatar và frame free
    const [avatars, frames] = await Promise.all([
      this.avatarModel.find({ type: 'free' }),
      this.frameModel.find({ type: 'free' }),
    ]);

    // Chọn random
    const randomAvatar =
      avatars.length > 0
        ? avatars[Math.floor(Math.random() * avatars.length)]
        : null;

    const randomFrame =
      frames.length > 0
        ? frames[Math.floor(Math.random() * frames.length)]
        : null;


    const user = await this.usersService.create({
      ...createUserDto,
      emailVerificationToken,
      avatar: randomAvatar?._id,
      frame: randomFrame?._id
    } as any);

    await this.userItemModel.create({
      userId: user._id,
      avatars: avatars.map(a => a._id),
      frames: frames.map(f => f._id)
    })

    await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    // Nếu là student thì khởi tạo danh sách thành tựu
    if (user.role === 'student') {

      const achievements = await this.achievementModel.find({ isActive: true });

      const studentAchievements = achievements.map(a => ({
        studentId: user._id,
        achievementId: a._id,
        progressCount: 0,
        isCompleted: false,
        rewardClaimed: false,
      }));

      await this.studentAchievementModel.insertMany(studentAchievements);
    }

    return {
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        point: user.point,
        exp: user.exp,
        avatar: randomAvatar?._id,
        frame: randomFrame?._id
      },
    };
  }


  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    if (!user.isEmailVerified) throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa');

    const payload = { sub: user._id, username: user.username, role: user.role };

    // Sinh accessToken & refreshToken
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '7d'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Lưu refreshToken xuống DB để kiểm tra khi refresh
    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);

    // Cập nhật lastLogin
    await this.usersService.updateLastLogin(user._id.toString());

    // Trả user info (ẩn password, refreshToken)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        frame: user.frame,
        point: user.point,
        exp: user.exp
      },
    };
  }


  async refreshToken(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { username: user.username, sub: user._id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async removeRefreshTokenByToken(token: string) {
    await this.userModel.updateOne(
      { refreshToken: token },
      { $unset: { refreshToken: "" } }
    );
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) throw new BadRequestException('Token xác thực không hợp lệ');

    await this.usersService.update(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationToken: "",
    } as any);

    return { message: 'Email đã được xác thực thành công' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Không tìm thấy tài khoản với email này');

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 giờ

    await this.usersService.update(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    } as any);

    await this.emailService.sendPasswordResetEmail(email, resetToken);
    return { message: 'Đã gửi link đặt lại mật khẩu vào email của bạn' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    } as any);

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Đăng xuất thành công' };
  }
}
