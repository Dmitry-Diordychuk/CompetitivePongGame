import React from "react";
import { Figure, Container, Row, Col, Accordion } from "react-bootstrap";
import Matches from "./Matches";
import {useAuth} from "../auth/auth.context";
import {useParams} from "react-router-dom";
import NotFound from "./NotFound";
import { useFetch } from "usehooks-ts";

const url = `http://localhost:3001/api/profile/`;

interface AchievementInterface {
  id: number;
  title: string;
  description: string;
}

interface MatchInterface {
  id: number;
  type: "ladder" | "duel";
  create_at: Date;
}

interface UserProfileInterface {
  id: number;
  username: string;
  victories: number;
  losses: number;
  exp: number;
  level: number;
  image: string;
  achievements: AchievementInterface[];
  winMatches: MatchInterface[];
  lossMatches: MatchInterface[];
}

interface ProfileInterface {
  profile: UserProfileInterface;
}

export default function Profile() {
  let { id } = useParams<"id">();
  let auth = useAuth();

  if (id === undefined) {
    id = auth.user.id;
  }

  if (!id) {
    <NotFound />
  }

  const { data, error } = useFetch<ProfileInterface>(url + id, {
    method: "GET",
    headers: {
      Authorization: 'Bearer ' + auth.user.token,
    }
  });

  if (error) return <p>There is an error. </p>;
  if (!data) return <p>Loading... </p>;

  let idNumber : number;
  if (id === undefined)
    idNumber = 0;
  else
    idNumber = +id;

  return (
    <Container>
      <Row>
        <Col>
          <Figure>
            <Figure.Image
              width={171}
              height={180}
              alt="avatar"
              src={data.profile.image}
            />
          </Figure>
        </Col>
        <Col>
          <h1>{data.profile.username}</h1>
          <div>Level: {data.profile.level}</div>
          <div>Victories: {data.profile.victories}</div>
          <div>Losses: {data.profile.losses}</div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Accordion defaultActiveKey="0">
            {data.profile.achievements.map((a, i) => (
              <Accordion.Item eventKey={i.toString()} key={i}>
                <Accordion.Header>{a.description}</Accordion.Header>
                <Accordion.Body>{a.title}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
        <Col>
          <Matches userId={idNumber} />
        </Col>
      </Row>
    </Container>
  );
}
