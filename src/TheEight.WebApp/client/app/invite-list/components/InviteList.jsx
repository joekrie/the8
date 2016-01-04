import Email from './Email';

function createEmail(email, index, deleteEmail) {
    return (
        <Email>
    );
}

export default function(props) {
    const { emails, deleteEmail } = props;

    return (
        <div className='boat-list'>
            {emails.map((email, index) => createEmail(email, index, deleteEmail))}
        </div>
    );
}