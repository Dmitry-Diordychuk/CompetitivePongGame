import axios from "axios";
import {API_URL, HTTP_PORT} from "../config";

const url = `${API_URL}:${HTTP_PORT}/api/user/login?code=`

const ftAuthProvider = {
    signin(code: string, successfulCallback: Function, errorCallback: Function) {
        axios.get(url + code)
            .then((response) => successfulCallback(response.data))
            .catch((error) => {
                successfulCallback(error.response);
            });
    },
    signout(callback: VoidFunction) {
        callback();
    }
};

export { ftAuthProvider };
