import 'expose?React!react';
import ReactDOM from 'react-dom';
import UserInviter from './accounts/user-inviter/App.jsx';

ReactDOM.render(
    <UserInviter initialEmails={["joe.kriefall@gmail.com", "john.doe@comcast.net"]} />,
    document.getElementById("app")
);