import React, {useState} from "react";
import Matches from "./Matches";
import {useAuth} from "../auth/auth.context";
import {useNavigate, useParams} from "react-router-dom";
import NotFound from "./NotFound";
import {useInterval} from "usehooks-ts";
import axios from "axios";
import Stack from "react-bootstrap/Stack";
import {API_URL, HTTP_PORT} from "../config";
import "../styles/Profile.css";
import {Button, Box, Container, Accordion, AccordionSummary, AccordionDetails, Typography} from '@mui/material';


const url = `${API_URL}:${HTTP_PORT}/api/profile/`;

export default function Profile() {
  let params = useParams<"id">();
  const auth = useAuth();
  const navigate = useNavigate();
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
      <Box className='user'>
          <img className='avatar' alt={"avatar"} src={data.profile.image}/>
            <Stack>
              <div>
                <h2 className='username'>{data.profile.username}</h2>
              </div>
              <div>
                {id === auth.user.id ?
                <Button onClick={() => navigate('/settings')} sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: '6px 6px 6px 8px',

                  position: 'absolute',
                  width: '103px',
                  height: '36px',
                  left: '240px',
                  top: '148px',

                  background: '#525252',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                }}>settings</Button> : <></>}
              </div>
            </Stack>

            <Box className='stat'>
              <Box sx={{
                paddingLeft: '24px',
                paddingTop: '23px',
                paddingBottom: '10px',
              }}>
                <Stack>
                  <Typography variant="h3" sx={{paddingBottom: 2}}>Stat</Typography>
                  <Typography variant="h5">Level: {data.profile.level}</Typography>
                  <Typography variant="h5">Victories: {data.profile.victories}</Typography>
                  <Typography variant="h5">Losses: {data.profile.losses}</Typography>
                </Stack>
              </Box>
            </Box>

            <Box className='matches'>
              <Box sx={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '23px',
                paddingBottom: '10px',
              }}>
                <Stack>
                  <Typography variant="h4" sx={{paddingBottom: 2}}>Matches</Typography>
                  <Box className='matches.history'>
                    <div><Matches userId={idNumber} /></div>
                  </Box>
                </Stack>
              </Box>
            </Box>
      </Box>

      <Box className='achievements'>
        <Stack>
          <Typography variant="h3" sx={{
            paddingLeft: '44px',
            paddingTop: '43px',
            paddingBottom: '10px',
            color: 'rgba(255, 255, 255, 0.87)',
          }}>Achievements</Typography >
          <Box sx={{
            paddingLeft: '44px',
            paddingRight: '44px',
            paddingTop: '20px',
            overflow: 'auto',
            maxHeight: 520,
            "&::-webkit-scrollbar": { display: "none" },
          }}>
              {data.profile.achievements.map((a:any, i:number) => (
                <Accordion>
                  <AccordionSummary>{a.description}</AccordionSummary>
                  <AccordionDetails>{a.title}</AccordionDetails>
                </Accordion>
              ))}
          </Box>
        </Stack>
      </Box>
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