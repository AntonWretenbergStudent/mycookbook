// Import relative to the mobile directory
const { formatMemberSince, formatPublishDate } = require('../lib/utils');

describe('Utils Functions', () => {
  test('formatMemberSince returns month and year format', () => {
    const testDate = new Date();
    
    const result = formatMemberSince(testDate);
    
    const expectedMonth = testDate.toLocaleDateString("default", { month: "short" });
    const expectedYear = testDate.getFullYear();
    const expected = `${expectedMonth} ${expectedYear}`;
    
    expect(result).toBe(expected);
  });

  test('formatPublishDate returns month, day, and year format', () => {
    const testDate = new Date();
    
    const result = formatPublishDate(testDate);
    
    const expectedMonth = testDate.toLocaleDateString("default", { month: "long" });
    const expectedDay = testDate.getDate();
    const expectedYear = testDate.getFullYear();
    const expected = `${expectedMonth} ${expectedDay}, ${expectedYear}`;
    
    expect(result).toBe(expected);
  });
});