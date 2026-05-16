import { SetMetadata } from '@nestjs/common';
import { Grade } from '../enums/grade';

export const GRADES_KEY = 'grades';
export const Grades = (...grades: Grade[]) => SetMetadata(GRADES_KEY, grades);