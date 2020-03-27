import React from 'react'

export default (props: any) => {
    return (
        <div>{props.match.params.id}</div>
    )
}