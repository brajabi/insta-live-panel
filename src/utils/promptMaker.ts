import { db } from "@/db";

export const solveQuestionPrompt = async (
  gradeId: number | null,
  courseId: number | null
) => {
  if (!gradeId || !courseId) {
    return `سوال از درس های کشور ایران هست . پاسخ اون رو پیدا کن. و نکات زیر رو رعایت کن:
  ساختار زیر رو در جواب رعایت کن: 
  [متن سوال]
  [پاسخ]
  [روش حل]`;
  }

  const grade = await db.grade.findUnique({
    where: {
      id: gradeId,
    },
  });

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (grade && !course) {
    return `سوال از درس های کشور ایران هست . پاسخ اون رو پیدا کن. موارد زیر رو رعایت کن:
    1. سوال در سطح کلاس ${grade?.name} هست.
    2. ساختار زیر رو در جواب رعایت کن: 
    [متن سوال]
    [پاسخ]
    [روش حل]`;
  }

  return `سوال از درس های کشور ایران هست . پاسخ اون رو پیدا کن. موارد زیر رو رعایت کن:
    1. سوال در سطح کلاس ${grade?.name} هست.
    2. سوال در درس ${course?.name} هست.
    3. ساختار زیر رو در جواب رعایت کن: 
    [متن سوال]
    [پاسخ]
    [روش حل]`;
};

export const solveQuestionPromptWithImages = async () => {
  return `# Image Analysis Prompt
Please analyze the exam question image and generate a JSON output with the following specifications:

## Required Information
- Question coordinates (start and end positions)
- Full question text
- Question type (if applicable)

## Coordinate System Rules
- Origin (0,0) at top-left corner of image
- Measure in pixels
- Include both start [x1,y1] and end [x2,y2] coordinates
- Measure from the beginning of question text/number

## Output json Format
{
  "questions": [
    {
      "id": "number",
      "coordinates": {
        "start": [x1, y1],
        "end": [x2, y2]
      },
      "questionText": "string",
      "questionType": "multipleChoice" | "text" | "blank"
    }
  ]
}`;
};

export const solveQuestionPromptMath = async (
  gradeId: number | null,
  courseId: number | null,
  question: string
) => {
  if (!gradeId || !courseId) {
    return `تو یک معلم با تجربه و متخصص هستی. لطفا سطح درسی این سوال رو پیدا کن. و سپس سوال رو به صورت گام به گام و با زبانی ساده توضیح بده.

    سوال: 
  ${question}

  پاسخ با فرمت زیر باشه:
  پاسخ نهای: 
  [پاسخ]
  روش حل:
  [روش حل]`;
  }

  const grade = await db.grade.findUnique({
    where: {
      id: gradeId,
    },
  });

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (grade && !course) {
    return `تو یک معلم ${grade?.name}  با تخصص در آموزش به دانش‌آموزان کلاس ${grade?.name} هستی. لطفا سطح درسی این سوال رو پیدا کن. و سپس سوال رو به صورت گام به گام و با زبانی ساده توضیح بده.

    سوال: 
  ${question}

پاسخ با فرمت زیر باشه:
  پاسخ نهای: 
  [پاسخ]
  روش حل:
  [روش حل]
  `;
  }

  return `تو یک معلم ${grade?.name}  با تخصص در آموزش به دانش‌آموزان کلاس ${course?.name} کلاس ${grade?.name} هستی. لطفا سطح درسی این سوال رو پیدا کن. و سپس سوال رو به صورت گام به گام و با زبانی ساده توضیح بده.

    سوال: 
  ${question}

پاسخ با فرمت زیر باشه:
  پاسخ نهای: 
  [پاسخ]
  روش حل:
  [روش حل]`;
};
