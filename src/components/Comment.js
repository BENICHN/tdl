import User from "./User"
import parse from 'html-react-parser'

export default function Comment(props) {
    return <div className='com fr'>
        <User user={props.com.user} />
        <div className='f1 comcontent'>
            <div className='comage'>Il y a <b>{props.com.comage}</b></div>
            {parse(props.com.comcontent)}
        </div>
    </div>
}