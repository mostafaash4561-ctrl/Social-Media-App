import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL, authConfig } from "../Logic/suggestions";
import type { UserProfile } from "../Types/userProfile";

export default function useMyProfile() {
  return useQuery({
    queryKey: ["getMyProfile"],
    queryFn: () => axios.get(`${API_URL}/users/profile-data`, authConfig()),
    select: (res) => res.data?.data?.user as UserProfile | undefined,
  });
}
