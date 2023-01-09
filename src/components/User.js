import { stringFromSize } from "../utils";

export default function User(props) {
    return <div className='user fc oh'>
        <a href={props.user.userurl}>
            <div className='avatar oh'><img src={props.user.avatarurl} alt={'Avatar de ' + props.user.username}/></div>
            <div className='username'><i>{props.user.username}</i></div>
            <div className='updnsz fr'>
                <div className='upsz f1'>{stringFromSize(props.user.upsize)}</div>
                <div className='dnsz f1'>{stringFromSize(props.user.downsize)}</div>
            </div>
        </a>
    </div>
}