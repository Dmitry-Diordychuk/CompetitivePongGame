import axios from "axios";

const backdoorProvider = {
    signin(username: string, successfulCallback: Function, errorCallback: VoidFunction) {
        let token = null;
        if (username === 'A_user') {
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMSIsImZ0SWQiOiIxIiwidXNlcm5hbWUiOiJBX3VzZXIifQ.3GrurQz8RZ3CghTnXcJIHulU6KMQXHXj7XL6adY_NJg';
        } else if (username === 'B_user') {
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMiIsImZ0SWQiOiIyIiwidXNlcm5hbWUiOiJCX3VzZXIifQ.diAuyuEuB90hgzH4A4gbcwk4GyQ45w7R3QF0UKMiXio';
        } else if (username === 'C_user') {
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMyIsImZ0SWQiOiIzIiwidXNlcm5hbWUiOiJDX3VzZXIifQ.zKQs-ZTDK3JCrou_ojapbL7NtJqXhEzOVbKCR0nJ-uk';
        } else {
            errorCallback();
        }
        axios.get("http://localhost:3001/api/user", {
            headers : {
                "authorization": "Bearer " + token,
            }
        })
            .then((response) => successfulCallback(response.data))
            .catch(errorCallback)
    },
};

export { backdoorProvider };
