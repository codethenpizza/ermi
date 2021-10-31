import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {AuthService} from "@core/services/AuthService";


export class RefreshTokenAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        const { refreshToken: requestToken } = req.body;

        if (requestToken == null) {
            return res.status(403).json({ message: "Refresh Token is required!" });
        }
        next();
    }

    async handle({body: {refreshToken}}: Request<any, any, {refreshToken: string, token: string}, any>, res: Response) {
        try {
            const tokens = await AuthService.refreshTokens(refreshToken)
            res.status(200).json(tokens)
        } catch (e) {
            console.log(e);
            res.status(400).send((e as Error).message);
        }
    }

}
