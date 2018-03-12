const TYPES = {
    AuthService: Symbol.for('AuthService'),
    IDBClient: Symbol.for('IDBClient'),
    UserDBClient: Symbol.for('IDBClient'),
    PostDBClient: Symbol.for('IDBClient'),
    IGraphDBClient: Symbol.for('IGraphDBClient'),
    OgmNeoDBClient: Symbol.for('OgmNeoDBClient'),
    OgmNeoDBConnection: Symbol.for('OgmNeoDBConnection'),
    PassportStrategies: Symbol.for('PassportStrategies'),
    IModelService: Symbol.for('IModelService'),
    ICommentService: Symbol.for('ICommentService'),
    IPostService: Symbol.for('IPostService'),
    ITagService: Symbol.for('ITagService'),
    IUserService: Symbol.for('IUserService'),
    ILikeBehavior: Symbol.for('ILikeBehavior'),
};

export default TYPES;
