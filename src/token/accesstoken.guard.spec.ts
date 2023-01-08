import { AccessTokenGuard } from './accesstoken.guard';

describe('AccesstokenGuard', () => {
  it('should be defined', () => {
    expect(new AccessTokenGuard()).toBeDefined();
  });
});
