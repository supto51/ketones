import { TextSanitizerPipe } from './text-sanitizer.pipe';

describe('TextSanitizerPipe', () => {
  it('create an instance', () => {
    const pipe = new TextSanitizerPipe();
    expect(pipe).toBeTruthy();
  });
});
