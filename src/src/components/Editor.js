import React, { Component } from 'react';
import { connect } from 'dva';
import { Drawer, Form, Input, InputNumber, Row, Skeleton, Button } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import u from '../utils/utils';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';

class Editor extends Component {
    state = {
        ttl: -1,
    };

    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible && this.props.visible) {
            this.load();
        }
    }

    load = () => {
        if (!u.isNoW(this.props.editingEntry)) {
            this.props.dispatch({
                type: 'editor/load',
                redisKey: this.props.editingEntry.Key,
                redisField: this.props.editingEntry.Field,
            });
        }
    };

    onTTLChange = (newTTL) => {
        this.props.dispatch({
            type: 'editor/setTTL',
            payload: { ttl: newTTL }
        });
    };

    onValueChanged = (editor, data, newValue) => {
        this.props.dispatch({
            type: 'editor/setValue',
            payload: { value: newValue }
        });
    };

    Beautify = (event) => {
        this.props.dispatch({
            type: 'editor/beautify',
            payload: { mode: this.props.mode }
        });
    };

    Minify = (event) => {
        this.props.dispatch({
            type: 'editor/minify',
            payload: { mode: this.props.mode }
        });
    };

    Save = (event) => {
        this.props.dispatch({
            type: 'editor/save',
            payload: { entry: this.props.entry }
        });
    };

    render() {
        const entry = this.props.entry ?? {};    // prevent undefined error
        const ttlVisible = u.isNoW(entry.Field);
        const fieldVisible = !u.isNoW(entry.Field);
        const valueEditorVisible = fieldVisible || entry.Type === "string";
        const mode = !u.isNoW(this.props.mode) ? this.props.mode : "text";

        const codemirrorOptions = {
            lineNumbers: true,
            theme: 'default',
            mode: mode,
        };

        const formatVisible = valueEditorVisible && mode !== 'text';
        let editorWidth = valueEditorVisible ? '80vw' : '20vw';

        return (
            <Drawer
                title={`${entry.Key} (${entry.Type})`}
                placement="right"
                width={editorWidth}
                onClose={this.props.onClose}
                visible={this.props.visible}
            >
                <Skeleton loading={this.props.isLoading} active>
                    <Form layout="inline">
                        <Row>
                            {
                                ttlVisible ? <Form.Item label="TTL">
                                    <InputNumber placeholder="TTL" value={entry.TTL} onChange={this.onTTLChange} />
                                </Form.Item> : null
                            }
                            {
                                fieldVisible ? <Form.Item label="Field">
                                    <Input placeholder="Field" value={entry.Field} />
                                </Form.Item> : null
                            }
                            {
                                formatVisible ? <Form.Item>
                                    <Button type="dashed" icon="code" onClick={this.Beautify}>Beautify</Button>
                                </Form.Item> : null
                            }
                            {
                                formatVisible ? <Form.Item>
                                    <Button type="dashed" icon="box-plot" onClick={this.Minify}>Compress</Button>
                                </Form.Item> : null
                            }
                            <Form.Item>
                                <Button type="primary" icon="save" onClick={this.Save} loading={this.props.isBusy}>Save</Button>
                            </Form.Item>
                        </Row>
                        {
                            valueEditorVisible ?
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