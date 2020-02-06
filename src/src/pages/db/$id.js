import KeyTable from '../../components/KeyTable';

export default function (props) {
    return (
        <KeyTable selectedDB={props.match.params.id} />
    )
}
