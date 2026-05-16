import { PartialType } from '@nestjs/swagger';
import { CreateLessonLearnDto } from './create-lesson-learn.dto';

export class UpdateLessonLearnDto extends PartialType(CreateLessonLearnDto) {}
