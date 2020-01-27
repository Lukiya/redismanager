import React, { Component } from 'react';
import { connect } from 'dva';
import { Drawer, Form, Input, InputNumber, Row, Skeleton, Select, Button } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2'
import u from '../utils/utils'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/css/css'

const { Option } = Select;

class Editor extends Component {
    state = {
        mode: 'text',
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

    onModeChange = (value) => {
        this.setState({
            mode: value
        })
    }

    Beautify = (event) => {
        this.props.dispatch({
            type: 'editor/beautify',
            payload: { value: this.props.entry.Value }
        });
    }

    Minify = (event) => {
        this.props.dispatch({
            type: 'editor/minify',
            payload: { value: this.props.entry.Value }
        });
    }

    onValueChanged = (editor, data, newValue) => {
        this.props.dispatch({
            type: 'editor/saveValue',
            payload: { value: newValue }
        });
    }

    render() {
        const entry = this.props.entry ?? {}    // prevent undefined error
        const ttlVisible = u.isNoW(entry.Field)
        const fieldVisible = !u.isNoW(entry.Field)
        const codeEditorVisible = fieldVisible || entry.Type === "string"
        const codemirrorOptions = {
            lineNumbers: true,
            theme: 'default',
            mode: this.state.mode,
        };

        return (
            <Drawer
                title={`${entry.Key} (${entry.Type})`}
                placement="right"
                width="80vw"
                onClose={this.props.onClose}
                visible={this.props.visible}
            >
                <Skeleton loading={this.props.isBusy} active>
                    <Form layout="inline">
                        <Row>
                            {
                                ttlVisible ? <Form.Item label="TTL">
                                    <InputNumber placeholder="TTL" value={this.state.TTL} onChange={this.onTTLChange} />
                                </Form.Item> : null
                            }
                            {
                                fieldVisible ? <Form.Item label="Field">
                                    <Input placeholder="Field" value={entry.Field} />
                                </Form.Item> : null
                            }
                            {
                                codeEditorVisible ? <Form.Item label="Highlight">
                                    <Select defaultValue="text" style={{ width: 120 }} onChange={this.onModeChange}>
                                        <Option value="text">text</Option>
                                        <Option value="javascript">js/json</Option>
                                        <Option value="xml">xml/html</Option>
                                        <Option value="css">css</Option>
                                    </Select>
                                </Form.Item> : null
                            }
                            {
                                codeEditorVisible ? <Form.Item>
                                    <Button type="dashed" icon="code" onClick={this.Beautify}>Format</Button>
                                </Form.Item> : null
                            }
                            {
                                codeEditorVisible ? <Form.Item>
                                    <Button type="dashed" icon="box-plot" onClick={this.Minify}>Compress</Button>
                                </Form.Item> : null
                            }
                        </Row>
                        {
                            codeEditorVisible ?
                                <CodeMirror value={entry.Value} options={codemirrorOptions} onChange={this.onValueChanged} />
                                : null
                        }
                    </Form>
                </Skeleton>
            </Drawer>
        )
    }
}

export default connect(({ editor }) => editor)(Editor)