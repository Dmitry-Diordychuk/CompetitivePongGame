import React from "react";
import { ListGroup } from "react-bootstrap";
import {useAuth} from "../auth/auth.context";
import {useFetch} from "usehooks-ts";

const url = `http://localhost:3001/api/match/user/`;

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
    <ListGroup>
      {data.map((m, i) => (
        <ListGroup.Item variant={m.winner_id === userId ? "success" : "danger"} key={i}>
          {m.match_type.toUpperCase() + ' '}
          {m.match_create_at.toString().split("T")[0] + " "}
          {m.match_create_at.toString().split("T")[1].split(".")[0] + " "}
          {m.winner_username + " "}
          {m.loser_username}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
