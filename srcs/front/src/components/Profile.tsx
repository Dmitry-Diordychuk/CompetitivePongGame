import React, {useEffect, useState} from "react";
import Matches from "./Matches";
import {useAuth} from "../auth/auth.context";
import {useParams} from "react-router-dom";
import NotFound from "./NotFound";
import {useInterval} from "usehooks-ts";
import Figure from 'react-bootstrap/Figure';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import axios from "axios";
import Stack from "react-bootstrap/Stack";
// import Button from "react-bootstrap/Button";
import {useContact} from "../contexts/contact.context";
import {API_URL, HTTP_PORT} from "../config";
import "../styles/Profile.css";
// import Button from '@mui/material/Button';
import { Button } from '@mui/material';

import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import Nav from "react-bootstrap/Nav";

const url = `${API_URL}:${HTTP_PORT}/api/profile/`;

export default function Profile() {
  let params = useParams<"id">();
  const auth = useAuth();
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  const [, setReset] = useState(false);
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

      <Container className='user'>
        <Row>
          <Col>
            <img className='avatar' alt={"avatar"} src={data.profile.image}/>
          </Col>
          <Col>
            <Stack>
              <div>
                <h2 className='username'>{data.profile.username}</h2>
              </div>
              <div>
                <Button /*variant="contained" */ className='settings'>settings</Button>
              </div>
            </Stack>
          </Col>
        </Row>

        <Row>
          <Col>
            <Container className='stat'>
              <Container className='stat.text'>
                <Stack>
                  <div><h3 className='stat.text.name'>Stat</h3></div>
                  <div>Level: {data.profile.level}</div>
                  <div>Victories: {data.profile.victories}</div>
                  <div>Losses: {data.profile.losses}</div>
                </Stack>
              </Container>
            </Container>
          </Col>
          <Col>
            <Container className='matches'>
              <Stack>
                <div><h4 className='matches.name'>Matches</h4></div>
                <Container className='matches.history'>
                  <div><Matches userId={idNumber} /></div>
                </Container>
              </Stack>
            </Container>
          </Col>
        </Row>

      </Container>

{/*

      <Row>
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
      </Row>
*/}

    </Container>
  );
}

function FriendButton(props: any) {
  const contact = useContact();

  useEffect(() => {}, [contact]);

  if (!props.userId) {
    return <></>
  }

  if (contact.isBanned({id: props.userId})) {
    return (<Button variant={"contained"} onClick={() => {
      contact.unban(props.userId);
    }}>Unban</Button>);
  }

  if (!contact.isFriend({id: props.userId})) {
    return (<Button onClick={() => {
      contact.addFriend(props.userId);
    }}>Add to friends</Button>);
  }

  return (
      <Button onClick={() => {
        contact.deleteFriend(props.userId);
      }}>Remove from friends</Button>
  );
}