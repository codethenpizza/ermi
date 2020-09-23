import {WheelSizeApiClient} from "./ApiClient";
import {wheelSize} from 'config';

export const WheelSizeApi = new WheelSizeApiClient(wheelSize.apiKey);
