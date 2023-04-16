import React, {useState} from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "./login.css";

import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css';

import personIconUrl from './Icons/person.png';
import restaurantIconUrl from './Icons/restaurant.png';
import deliverIconUrl from './Icons/deliver.png';


const url = 'wss://tarea-2.2023-1.tallerdeintegracion.cl/connect';

const Login = () => {
    const [loged,setLoged] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState({})
    const [restaurants, setRestaurants] = useState({})
    const [destinations, setDestinations] = useState({})
    const [deliveries, setDeliveries] = useState({})
    const [positions, setPositions] = useState({})
    const [chat, setChat] = useState({})
    const [status, setStatus] = useState({})


    function generateBasicAuthToken(email, studentNumber) {
      const credentials = `${email}:${studentNumber}`;
      const encodedCredentials = window.btoa(credentials);
      return `Basic ${encodedCredentials}`;
    }

    function joinWebSocket(username, password) {
      const token = generateBasicAuthToken(username, password);
      const ws = new WebSocket(url);
      setLoged(true);
    
      ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({
          "type": 'JOIN',
          "payload": {
            "authorization": `${token}`, //'Basic dGFyZWEyQHRhbGxlcmRlaW50ZWdyYWNpb24uY2w6MTIzNDU2Nzg='
          }
        }));
      });
    
      ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data)
        console.log(data);
        switch(JSON.parse(event.data).type) {

          case "USERS":
            const newUsers = {};
            data.payload.forEach((r) => {
              if (!(r.id in users)) {
                newUsers[r.id] = r;
              }
            });
            setUsers((prevUsers) => ({...newUsers,...prevUsers}));
            break;

          case "RESTAURANTS":
            const newRestaurants = {};
            data.payload.forEach((r) => {
              newRestaurants[r.id] = r;
            });
            setRestaurants(newRestaurants);
            break;

          case "DESTINATIONS":
            const newDestinations = {};
            data.payload.forEach((r) => {
              newDestinations[r.id] = r;
            });
            setDestinations(newDestinations);
            break;

          case "DELIVERIES":
            const newDeliveris = {};
            data.payload.forEach((r) => {
              newDeliveris[r.id] = r;
            });
            setDeliveries(newDeliveris);
            break;

          case "POSITION":
            const newP = {};
            newP[data.payload.delivery_id] = data.payload;
            setPositions((positions) => ({ ...positions, ...newP }));
            break;

          case "CHAT":
            const newC = {};
            newC[data.payload.date] = data.payload;
            setChat((chat) => ({ ...chat, ...newC }));
            break;

          case "DELIVERY_STATUS":
            const newD = {};
            newD[data.delivery_id] = data.payload;
            setStatus((statust) => ({ ...status, ...newD }));
          break;
          default:
            console.log("unknown")
        } 
      });
    
      ws.addEventListener('error', (errorEvent) => {
        console.error(errorEvent);
        // Handle WebSocket errors here
      });
    }



    function printInfo(del){
      if (del){
        return(
          <ListGroup>
            <ListGroup.Item>{users[del.user_id] ? `Usuario: ${users[del.user_id].name}`: ""}</ListGroup.Item>
            <ListGroup.Item>{restaurants[del.restaurant_id] ? `Restaurante: ${restaurants[del.restaurant_id].name}`: ""}</ListGroup.Item>
            <ListGroup.Item>{destinations[del.destination_id] ? `Destino: ${destinations[del.destination_id].name}`: ""}</ListGroup.Item>
          </ListGroup>
        )
      }
    }

    //maps

    const personIcon = L.icon({
      iconUrl: personIconUrl,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
    });
    const restaurantIcon = L.icon({
      iconUrl: restaurantIconUrl,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
    });
    const deliverIcon = L.icon({
      iconUrl: deliverIconUrl,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
    });

    //chat
    
    function printChat(chat){
      return(
        <Toast>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">{chat.name}</strong>
            <small className="text-muted">{chat.date.split(".")[0]}</small>
          </Toast.Header>
          <Toast.Body>{chat.content}</Toast.Body>
        </Toast>
      )
    }
    
   
  return(
    <div class="flex-container">
      <div class="map">
        {!loged ? (
          <>
            <h1>Iniciar sesión</h1>
            <form>
              <label>
                Usuario:
                <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
              </label>
              <br />
              <label>
                Contraseña:
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              <br />
              <button type="submit" onClick={(event) => {
                event.preventDefault();
                joinWebSocket(username, password);
              }}>Conectar</button>
            </form>
          </>
        ):(    
        <>
        <h1>Mapa</h1>
          <MapContainer center={[-33.45, -70.6]} zoom={12} scrollWheelZoom={false} style={{height: "90vh", width: "100%"}}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.values(restaurants).length > 0 ? (
              Object.values(restaurants).map((r) => {
                return (
                  <Marker position={[r.position.lat, r.position.long]} key={r.id} icon={restaurantIcon}>
                    <Popup>{r.name}</Popup>
                  </Marker>
                );
              })
            ) : (
              <></>
            )}

            {Object.values(destinations).length > 0 ? (
              Object.values(destinations).map((r) => {
                return (
                  <Marker position={[r.position.lat, r.position.long]} key={r.id} icon={personIcon}>
                    <Popup>{r.name}</Popup>
                  </Marker>
                );
              })
            ) : (
              <></>
            )}

            {Object.values(positions).length > 0 ? (
              Object.values(positions).map((r) => {
                const del = deliveries[r.delivery_id];
                if (del){
                  return (
                    <Marker position={[r.position.lat, r.position.long]} key={r.id} icon={deliverIcon}>
                      <Popup>{printInfo(del)}</Popup>
                    </Marker>
                  );
                }
                return null;
              })
            ) : (
              <></>
            )}
                    
            {Object.values(deliveries).length > 0 ? (
              Object.values(deliveries).map((r) => {
                const res = restaurants[r.restaurant_id];
                const dest = destinations[r.destination_id];
                if (res && dest){
                  return (
                    <Polyline positions={[[res.position.lat,res.position.long], [dest.position.lat,dest.position.long]]} color={'green'} weight ={4} />
                  );
                }
                return null;
              })
            ) : (
              <></>
            )}
          </MapContainer>
        </>)}
      </div>

      <div className = "chat">
      <h1 style={{color: 'white',backgroundColor : "black"}}>Chat</h1>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="bg-dark position-relative"
          style={{ height: '90%', overflow: 'auto' }}
        >
          <ToastContainer position="bottom-center" className="p-3">
          {Object.values(chat).length > 0 ? (
            Object.values(chat).map((r) => {
              return(printChat(r))
            })
          ) : (
            <></>
          )}
          </ToastContainer>
        </div>

      </div>
    </div>
  )
};

export default Login;