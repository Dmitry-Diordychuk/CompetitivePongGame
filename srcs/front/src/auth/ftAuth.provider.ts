import axios from "axios";

const url = `http://localhost:3001/api/user/login?code=`

const ftAuthProvider = {
    signin(code: string, successfulCallback: Function, errorCallback: VoidFunction) {
        axios.get(url + code)
            .then((response) => successfulCallback(response.data))
            .catch(errorCallback)
    },
    signout(callback: VoidFunction) {
        callback();
    }
};

export { ftAuthProvider };
