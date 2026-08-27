import { loadReferences, validateContent } from "../src/lib/content";

const lessons = validateContent();
const references = loadReferences();
console.log(`内容校验通过：${lessons.length} 节课程，${references.length} 条百科。`);
