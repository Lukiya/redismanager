export default (props: any) => {
    const { match } = props;
    console.log(match.params);
    return (<h1>{JSON.stringify(match.params)}</h1>);
};