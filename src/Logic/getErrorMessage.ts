import axios from "axios";

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const apiMessage = err.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage) return apiMessage;

    if (!err.response) return "Network error. Please check your connection.";

    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
