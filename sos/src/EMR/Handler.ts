import { http } from "../http"
import { EmrType } from "./model"
import { Patient } from "../Patient/model"

export const updateEMR = async (patientId: number, emr: EmrType) => {
  return http<Patient>("PATCH", `/patient/${patientId}/emr`, {
    params: {
      emr
    }
  })
}
