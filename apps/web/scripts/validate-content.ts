import { validateContent } from "../src/lib/content";

const lessons = validateContent();
console.log(`内容校验通过：${lessons.length} 节课程。`);
