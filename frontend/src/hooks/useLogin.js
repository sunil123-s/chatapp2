import { useMutation } from "@tanstack/react-query"
import axios from "axios"
// import BaseUrl from "./useAxios";

export const useLogin = () => {
    const {mutate:login,isLoading,isError,error} = useMutation({
        mutationFn: async(formdata) => {
            const res = await axios.post(
              `/auth/login`,
              formdata
            );
          const response = res.data;
          return response;
        }
    })
    return { login,isLoading, isError, error };
}