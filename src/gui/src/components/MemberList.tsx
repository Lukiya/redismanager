import { connect } from "umi";
import { Button, Table } from "antd";
import { MoreOutlined } from '@ant-design/icons';
import u from "@/u";

const buildColums = (props: any) => {
    const { memberListState: { type } } = props;

    let title = "Field";
    switch (type) {
        case u.LIST:
            title = "Index";
            break;
        case u.ZSET:
            title = "Score";
            break;
    }

    if (type != u.SET) {
        const columns: any[] = [
            {
                title: title,
                dataIndex: 'Field',
                key: 'Field',
                defaultSortOrder: "ascend",
                // onCell: this.showEditor,
                className: "pointer",
                sorter: (a: any, b: any) => {
                    const aType = typeof (a.Field);
                    if (aType == "string") {
                        return a.Field.localeCompare(b.Field);
                    } else {
                        return a.Field - b.Field;
                    }
                },
            },
            {
                title: "Value",
                dataIndex: "Value",
                className: "pointer",
                sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
            },
        ];
        return columns;
    } else {
        const columns: any[] = [
            {
                title: title,
                dataIndex: 'Field',
                key: 'Field',
                defaultSortOrder: "ascend",
                // onCell: this.showEditor,
                className: "pointer",
                sorter: (a: any, b: any) => a.Field.localeCompare(b.Field),
            },
        ];
        return columns;
    }
};

const buildFooter = (props: any) => {
    const { dispatch, memberListState: { hasMore }, loading } = props;

    const footer = () => <div style={{ textAlign: "center" }}>
        {
            hasMore ?
                <Button type="link" icon={<MoreOutlined />} loading={loading} onClick={() => dispatch({ type: "memberListVM/loadMore" })}>Load more...</Button>
                :
                <Button type="link" disabled>All keys loaded</Button>
        }
    </div>;
    return footer;
};

const MemberList = (props: any) => {
    // const { memberListState: { loading, dataSource, hasMore } } = props;
    const { memberListState: { dataSource, hasMore }, loading } = props;

    const columns = buildColums(props);
    const footer = buildFooter(props);

    return <Table
        rowKey="Field"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (total) => <label>{hasMore ? "Loaded" : "Total"}: {total}</label> }}
        footer={footer}
        className="sublist"
        size="small"
        bordered
    ></Table>;
};

// export default EntryEditor
export default connect(({ memberListVM, loading }: any) => ({
    memberListState: memberListVM,
    loading: loading.models.memberListVM,
}))(MemberList);