import React, {useEffect, useState} from "react";
import Matches from "./Matches";
import {useAuth} from "../auth/auth.context";
import {useNavigate, useParams} from "react-router-dom";
import NotFound from "./NotFound";
import {useFetch, useInterval, useTimeout} from "usehooks-ts";

import Figure from 'react-bootstrap/Figure';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import axios from "axios";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import {useContact} from "../contexts/contact.context";

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
  let params = useParams<"id">();
  const auth = useAuth();
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  const [reset, setReset] = useState(false);
  useInterval(() => {
    setReset(true);
  }, 1000)

  let id = params.id;

  if (id === undefined) {
    id = auth.user.id;
  }

  if (!id) {
    <NotFound />
  }

  useInterval(() => {
    axios.get(url + id, {
      headers: {
        Authorization: 'Bearer ' + auth.user.token,
      }
    }).then((response: any) => {
      setData(response.data);
    }).catch(() =>
      setError(true)
    )
  }, 1000);

  if (error) return <p>There is an error. </p>;
  if (!data) {
    return <progress />;
  }

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
          <Stack direction="horizontal" gap={3}>
            <h1>{data.profile.username}</h1>
            <FriendButton userId={params.id} />
          </Stack>
          <div>Level: {data.profile.level}</div>
          <div>Victories: {data.profile.victories}</div>
          <div>Losses: {data.profile.losses}</div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Accordion defaultActiveKey="0">
            {data.profile.achievements.map((a:any, i:number) => (
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

function FriendButton(props: any) {
  const contact = useContact();

  useEffect(() => {}, [contact.friendList]);

  if (!props.userId) {
    return <></>
  }

  console.log(contact.isFriend({id: props.userId}))
  if (!contact.isFriend({id: props.userId})) {
    return (<Button onClick={() => {
      contact.addFriend(props.userId);
      contact.uploadFriendList();
    }}>Add to friends</Button>);
  }

  return (
      <Button onClick={() => {
        contact.deleteFriend(props.userId);
        contact.uploadFriendList();
      }}>Remove from friends</Button>
  );
}