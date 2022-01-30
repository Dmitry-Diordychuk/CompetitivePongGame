import React, {useState} from "react";
import Matches from "./Matches";
import {useAuth} from "../auth/auth.context";
import {useParams} from "react-router-dom";
import NotFound from "./NotFound";
import {useInterval} from "usehooks-ts";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from "axios";
import Stack from "react-bootstrap/Stack";
import {API_URL, HTTP_PORT} from "../config";
import "../styles/Profile.css";
import { Button, Box, Container, Accordion } from '@mui/material';


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
      <Row>

      {/*  todo maybe style has been beaten because of replacement "container" to "box"*/}
      <Box className='user'>
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
                {/*todo styles doesn't apply*/}
                {/*todo make the button work*/}
                <Button /*variant="contained" */ className='settings'>settings</Button>
              </div>
            </Stack>
          </Col>
        </Row>

        <Row>
          <Col>
            <Box className='stat'>
              <Box className='stat.text'>
                <Stack>
                  <div><h3 className='stat.text.name'>Stat</h3></div>
                  <div>Level: {data.profile.level}</div>
                  <div>Victories: {data.profile.victories}</div>
                  <div>Losses: {data.profile.losses}</div>
                </Stack>
              </Box>
            </Box>
          </Col>
          <Col>
            <Box className='matches'>
              <Stack>
                <div><h4 className='matches.name'>Matches</h4></div>
                <Box className='matches.history'>
                  <div><Matches userId={idNumber} /></div>
                </Box>
              </Stack>
            </Box>
          </Col>
        </Row>
      </Box>

      <Box className='achievements'>
        <Stack>
          <div><h3 className='achievements.name'>Achievements</h3></div>
          <Box className='achievements.history'>
            {/*todo is it works?*/}
            <Accordion defaultActiveKey="0">
              {data.profile.achievements.map((a:any, i:number) => (
                <Accordion.Item eventKey={i.toString()} key={i}>
                  <Accordion.Header>{a.description}</Accordion.Header>
                  <Accordion.Body>{a.title}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            </Box>
        </Stack>
      </Box>
      </Row>

    </Container>
  );
}
//
// function FriendButton(props: any) {
//   const contact = useContact();
//
//   useEffect(() => {}, [contact]);
//
//   if (!props.userId) {
//     return <></>
//   }
//
//   if (contact.isBanned({id: props.userId})) {
//     return (<Button variant={"contained"} onClick={() => {
//       contact.unban(props.userId);
//     }}>Unban</Button>);
//   }
//
//   if (!contact.isFriend({id: props.userId})) {
//     return (<Button onClick={() => {
//       contact.addFriend(props.userId);
//     }}>Add to friends</Button>);
//   }
//
//   return (
//       <Button onClick={() => {
//         contact.deleteFriend(props.userId);
//       }}>Remove from friends</Button>
//   );
// }