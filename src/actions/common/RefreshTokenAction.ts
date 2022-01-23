import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {authService} from "@core/services";


export class RefreshTokenAction extends Action {

    constructor(
        private _authService = authService
    ) {
        super();
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        const {refreshToken: requestToken} = req.body;

        if (requestToken == null) {
            return res.status(403).json({message: "Refresh Token is required!"});
        }
        next();
    }

    async handle({body: {refreshToken}}: Request<any, any, { refreshToken: string, token: string }, any>, res: Response) {
        try {
            const tokens = await this._authService.refreshTokens(refreshToken)
            res.status(200).json(tokens)
        } catch (e) {
            console.log(e);
            res.status(400).send((e as Error).message);
        }
    }

}
