import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as express from 'express';
import * as morgan from 'morgan';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import TYPES from './constant/types';
import { AuthService } from './service/auth-service';
import { IPostService, PostService } from './service/post-service';
import { IUserService, UserService } from './service/user-service';
import { ITagService, TagService } from './service/tag-service';
import { ICommentService, CommentService } from './service/comment-service';
import { PassportStrategies } from './service/passport-strategies';
// import { IModel } from './model/model';
import { OgmNeoDBConnection } from './utils/ogmneo/ogmneo-connection';
import { OgmNeoDBClient } from './utils/ogmneo/ogmneo-client';
import { IDBClient } from './utils/db-client';
import './controller/home';
import './controller/auth-controller';
import './controller/post-controller';

// load everything needed to the Container
let container = new Container();

if (process.env.NODE_ENV === 'development') {
    let logger = makeLoggerMiddleware();
    container.applyMiddleware(logger);
}

// container.bind<IDBClient<IPost>>(TYPES.IDBClient).to(OgmNeoDBClient);
// container.bind<IDBClient<IUser>>(TYPES.IDBClient).to(OgmNeoDBClient);

container.bind<PassportStrategies>(TYPES.PassportStrategies).to(PassportStrategies).inSingletonScope();
container.bind<OgmNeoDBConnection>(TYPES.OgmNeoDBConnection).to(OgmNeoDBConnection).inSingletonScope();
container.bind<IDBClient>(TYPES.IDBClient).to(OgmNeoDBClient).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<ICommentService>(TYPES.ICommentService).to(CommentService).inSingletonScope();
container.bind<IPostService>(TYPES.IPostService).to(PostService).inSingletonScope();
container.bind<ITagService>(TYPES.ITagService).to(TagService).inSingletonScope();
container.bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();

container.bind<express.RequestHandler>('Morgan').toConstantValue(morgan('combined'));

// start the server
let server = new InversifyExpressServer(container);
server.setConfig((appl) => {
  appl.use(bodyParser.urlencoded({
    extended: true
  }));
  appl.use(bodyParser.json());
  appl.use(helmet());
});

let app = server.build();
app.listen(3000);
console.log('Server started on port 3000 :)');

exports = module.exports = app;
