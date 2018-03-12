import { injectable } from 'inversify';

@injectable()
export class FacebookAuth {
  public static clientID = 'my-fp-app-id';
  public static clientSecret = 'my-fb-app-secret';
  public static enableProof = false;
}
