import React from "react";
import {useAuth} from "../auth/auth.context";
import {useFetch} from "usehooks-ts";
import {API_URL, HTTP_PORT} from "../config";
import {Paper, Stack, Typography} from "@mui/material";

const url = `${API_URL}:${HTTP_PORT}/api/match/user/`;

type MatchesProps = {
  userId: number;
};

interface MatchInterface {
  match_id: number;
  match_type: "ladder" | "duel";
  match_create_at: Date;
  winner_id: number;
  loser_id: number;
  winner_username: string;
  loser_username: string;
}

export default function Matches({ userId }: MatchesProps) {
  let auth = useAuth();

  const { data, error } = useFetch<MatchInterface[]>(url + userId, {
    method: "GET",
    headers: {
      Authorization: 'Bearer ' + auth.user.token,
    }
  });

  if (error) return <p>Ther is an error. </p>;
  if (!data) return <progress/>;

  return (
    <Stack sx={{ overflow: 'auto', maxHeight: 280, "&::-webkit-scrollbar": { display: "none" } }}>
      {data.map((m, i) => (
        <Paper sx={{
          marginBottom: 1,
          p: 1,
          backgroundColor: m.winner_id === userId ? "#006400" : "#8B0000",
        }} key={i}>
          <Typography sx={{color: 'rgba(255, 255, 255, 0.87)'}}>{m.match_type.toUpperCase() + ' '}
          {m.match_create_at.toString().split("T")[0] + " "}
          {m.match_create_at.toString().split("T")[1].split(".")[0] + " "}
          {m.winner_username + " "}
          {m.loser_username}</Typography>
        </Paper>
      ))}
    </Stack>
  );
}
