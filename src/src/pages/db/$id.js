import KeyList from '../../components/KeyList'

export default function (props) {
    return (
        <KeyList db={props.match.params.id} />
    )
}
