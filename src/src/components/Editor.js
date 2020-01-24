import React, { Component } from 'react';
import { connect } from 'dva';
import { Drawer, Form, Input, InputNumber, Row, Skeleton } from 'antd';
import CodeMirror from 'codemirror-react';
import u from '../utils/utils'

class Editor extends Component {
    state = {
        mode: 'javascript',
        ttl: -1,
    }

    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible && this.props.visible) {
            this.load()
        }
    }

    load = () => {
        if (!u.isNoW(this.props.editingEntry)) {
            this.props.dispatch({
                type: 'editor/getEntry',
                redisKey: this.props.editingEntry.Key,
                redisField: this.props.editingEntry.Field,
            });
        }
    };

    onTTLChange = (value) => {
        this.props.entry.TTL = value
        this.props.dispatch({
            type: 'editor/saveEntry',
            payload: { entry: this.props.entry },
        });
    }

    render() {
        const entry = this.props.entry ?? {}    // prevent undefined error

        return (
            <Drawer
                title={entry.Key}
                placement="right"
                width="80vw"
                onClose={this.props.onClose}
                visible={this.props.visible}
            >
                <Skeleton loading={this.props.isBusy} active>
                    <Form layout="inline">
                        <Row>
                            <Form.Item label="Field">
                                <Input placeholder="Field" />
                            </Form.Item>
                            <Form.Item label="TTL">
                                <InputNumber placeholder="TTL" value={this.props.entry.TTL} onChange={this.onTTLChange} />
                            </Form.Item>
                        </Row>
                    </Form>
                    <CodeMirror
                        value={entry.Value}
                        mode={this.state.mode}
                        theme='default'
                        tabSize={2}
                        lineNumbers={true}
                    />
                </Skeleton>
            </Drawer>
        )
    }
}

function mapStateToProps(state) {
    const s = state["editor"]
    return { entry: s.entry, isBusy: s.isBusy };
}

export default connect(mapStateToProps)(Editor)