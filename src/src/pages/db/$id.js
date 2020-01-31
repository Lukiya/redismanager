import KeyTable from '../../components/KeyTable';

export default function (props) {
    return (
        <KeyTable db={props.match.params.id} />
    )
}
