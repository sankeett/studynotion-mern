import axios from "axios"

export const axiosInstance = axios.create({})

export const apiConnector = (
  method,
  url,
  bodyData = {},
  headers = {},
  params = {}
) => {
  return axiosInstance({
    method,
    url,
    data: bodyData,   // ✅ ALWAYS pass an object
    headers,          // ✅ NEVER null
    params,           // ✅ NEVER null
  })
}
