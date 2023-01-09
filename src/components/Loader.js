export default function Loader(props) {
    return props.isLoading ? <div className='loader'><img src='images/loading.gif' alt='Loading...'/></div> : (props.children ?? [])
}