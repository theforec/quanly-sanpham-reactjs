import React, { Component } from 'react';
import './styles.css';

export default class QuanLySanPham extends Component {
    constructor(props) {
        super(props);

        this.tableContent = document.createElement("table");
        this.tableContent.id = "table";

        this.listItems = JSON.parse(localStorage.getItem("listItems")) || [];
        this.listItemsFiltered = [];
        this.state = {
            displayModal: "none",
            displayList: this.renderTable(this.listItems),
            isAdding: true,
            isReadOnly: false,
            isFiltering: false,
            searchInput: "",
            idItem: "",
            nameItem: "",
            priceItem: "",
            noteItem: "",
        }
    }

    reRender = (list) => {
        this.setState({
            displayList: list.length === 0 ? this.showEmptyTable() : this.renderTable(list)
        })
    }

    renderItem = (item, index) => {
        return <tr key={index}>
            <td>{item.idItem}</td>
            <td>{item.nameItem}</td>
            <td>{item.noteItem}</td>
            <td className="donGia">{item.priceItem}</td>
            <td className="action">
                <input type="button" onClick={() => this.editItem(index)} value="Sửa" /> | <input type="button" onClick={() => this.deleteItem(index)} value="Xoá" />
            </td>
        </tr>
    }

    renderTable = (list) => {
        var table = [];
        for (var i = 0; i < list.length; i++)
            table.push(this.renderItem(list[i], i));
        return table;
    }

    isEmptyList(list) {
        return list.length === 0;
    }

    showEmptyTable() {
        return <tr><th colSpan="5" className="empty">Không có sản phẩm</th></tr>
    }

    addItem = () => {
        this.setState({
            isAdding: true,
            isReadOnly: false
        })
        this.clearModal();
        this.showModal();
    }

    editItem = (index) => {
        this.showModal();
        var item;
        if (this.state.isFiltering) item = this.listItemsFiltered[index];
        else item = this.listItems[index];
        this.setState({
            isAdding: false,
            isReadOnly: true,
            idItem: item.idItem,
            nameItem: item.nameItem,
            priceItem: item.priceItem,
            noteItem: item.noteItem,
        })
    }

    deleteItem = (index) => {
        if (!this.state.isFiltering) {
            this.listItems.splice(index, 1);
            this.reRender(this.listItems);
        } else { //filtering
            var item = this.listItemsFiltered[index];
            //delete item
            this.listItems = this.listItems.filter(sp => sp.idItem !== item.idItem);
            this.listItemsFiltered = this.listItemsFiltered.filter(sp => sp.idItem !== item.idItem);
            this.reRender(this.listItemsFiltered);
        }
        this.saveStorage();
    }

    searchChange = (e) => {
        this.setState({ searchInput: e.target.value });
        // this.searchItems();
    }

    searchItems = () => {
        var searchInput = this.state.searchInput;
        if (searchInput.length === 0) {
            this.setState({ isFiltering: false });
            this.reRender(this.listItems);
            return;
        }
        this.setState({ isFiltering: true });
        this.listItemsFiltered = this.listItems.filter(sp =>
            sp.idItem.toLowerCase().search(searchInput) !== -1 || sp.nameItem.toLowerCase().search(searchInput) !== -1 ||
            sp.priceItem.toLowerCase().search(searchInput) !== -1 || sp.noteItem.toLowerCase().search(searchInput) !== -1)

        this.reRender(this.listItemsFiltered);
    }

    confirm = () => {
        var item = this.getModalValue();
        var errorInfo = 0;
        //validate form
        if (item.idItem === "" || item.nameItem === "" || item.priceItem === "") {
            errorInfo++;
            var string = "";
            if (item.idItem === "") string += "Mã sản phẩm,";
            if (item.nameItem === "") string += " Tên sản phẩm,";
            if (item.priceItem === "") string += " Đơn giá,";
            string = string.substr(0, string.length - 1);
            string += " không được bỏ trống";
            alert(string);
        }
        //info correct
        if (errorInfo === 0) {
            //adding
            if (this.state.isAdding) {
                var errorId = 0;
                this.listItems.find(sp => {
                    if (item.idItem === sp.idItem)
                        errorId++;
                });
                if (errorId !== 0) {
                    alert("Mã sản phẩm không được trùng");
                    return;
                }
                this.listItems.push(item);
                this.saveStorage();
                this.reRender(this.listItems);
            }
            //editing
            else {
                var _index;
                this.listItems.find((sp, i) => {
                    if (sp.idItem === item.idItem) {
                        _index = i;
                    }
                });
                this.listItems[_index] = item;
                //default
                if (!this.state.isFiltering)
                    this.reRender(this.listItems);
                //filtering
                else {
                    //edit item in listItemsFiltered[]
                    this.listItemsFiltered.find((sp, i) => {
                        if (sp.idItem === item.idItem) {
                            _index = i;
                        }
                    });
                    this.listItemsFiltered[_index] = item;
                    this.reRender(this.listItemsFiltered);
                }
            }
            this.saveStorage();
            this.closeModal();
        }
    }

    clearModal = () => {
        this.setState({
            idItem: "",
            nameItem: "",
            priceItem: "",
            noteItem: "",
        })
    }

    handleChange = (e, field) => {
        this.setState({
            [field]: e.target.value,
        })
    }

    getModalValue() {
        var item = {
            idItem: this.state.idItem,
            nameItem: this.state.nameItem,
            priceItem: this.state.priceItem,
            noteItem: this.state.noteItem,
        }
        return item;
    }

    showModal = () => {
        this.setState({ displayModal: "block" })
    }

    closeModal = () => {
        this.setState({ displayModal: "none" })
    }

    saveStorage = () => {
        localStorage.setItem("listItems", JSON.stringify(this.listItems));
    }

    render() {
        return (
            <div id="root">
                <div id="header">
                    <div id="caption">Quản lý sản phẩm ReactJs</div>
                    <div id="searchBar">
                        <button id="buttonAddItem" type="button" onClick={() => this.addItem()}>
                            Thêm sản phẩm </button>
                        <input type="text" placeholder="Tìm kiếm sản phẩm" onChange={(event) => { this.searchChange(event) }} />
                        <button type="button" onClick={() => this.searchItems()} >
                            Tìm kiếm</button>
                    </div>
                </div >
                <div className="addModal" style={{ display: this.state.displayModal }} >
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="close" onClick={() => this.closeModal()}>&times;</span>
                            <h3>{this.state.isAdding ? "Thêm sản phẩm" : "Sửa sản phẩm"}</h3>
                        </div>
                        <div className="modal-body">
                            <form id="inputData">
                                <input value={this.state.idItem} onChange={(event) => this.handleChange(event, "idItem")} type="text" placeholder="Mã sản phẩm" readOnly={this.state.isReadOnly} />
                                <input value={this.state.nameItem} onChange={(event) => this.handleChange(event, "nameItem")} type="text" placeholder="Tên sản phẩm" />
                                <input value={this.state.noteItem} onChange={(event) => this.handleChange(event, "noteItem")} type="text" placeholder="Ghi chú" />
                                <input value={this.state.priceItem} onChange={(event) => this.handleChange(event, "priceItem")} type="text" placeholder="Đơn giá" />
                            </form>
                            <form id="formButton">
                                <button id="confirm" type="button" onClick={() => this.confirm()}>
                                    Xác nhận </button>
                                <button id="clear" type="button" onClick={() => this.clearModal()}>
                                    Thử lại </button>
                            </form>
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr id="label">
                            <th>Mã sản phẩm</th>
                            <th>Tên sản phẩm</th>
                            <th>Ghi chú</th>
                            <th>Đơn giá</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="body">
                        {this.isEmptyList(this.listItems) ?
                            this.showEmptyTable()
                            : this.state.displayList
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}