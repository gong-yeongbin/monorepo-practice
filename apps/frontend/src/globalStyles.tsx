import styled, { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import { Button } from 'antd';
import { DataGrid } from '@mui/x-data-grid';
import 'antd/dist/antd.css';

const GlobalStyles = createGlobalStyle`
${normalize}

  :root {
      --yellow: #ffc912;
      --black: #20110b;
      --grey:#aaaaaa;
      --light-grey:#f0f0f0;
      --blue:#1890ff;
      --light-blue:#E5EEFD;
      --purple:#4C35DF;
    }
    * {
      margin:0;
      padding:0;
      box-sizing:border-box;
      font-family: 'IBM Plex Sans KR', sans-serif;
      color:var(---black);
      font-size:12px;
    }
    ol, ul, dl {
      margin:0;
      padding:0;
      list-style:none;
    }
    ::-webkit-scrollbar { 
      height: 10px;
    }
    ::-webkit-scrollbar-thumb { 
      background-color: var(--grey); 
      border-radius:10px;
    }
    ::-webkit-scrollbar-track {
      background-color:var(--light-grey); 
      box-shadow: inset 0px 0px 5px white;
    }
    .layout{
      height: 100vh;
    }
    .ant-layout-header{
      padding:0 2rem;
    }
    .ant-breadcrumb {
      padding:0 1.5rem;
      margin: 1rem 0;
    }
    .ant-dropdown-link {
      margin-right:0.5rem;
    }
    .ant-breadcrumb-link {
      font-size:20px;
      font-weight:bold;
    }
    .ant-btn {
      color: var(--black); 
      border-radius:10px;
      box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
    }
    .ant-btn:hover, .ant-btn:focus {
      color: var(--black); 
      border-color: var(--light-grey);
    }
    .ant-btn-primary {
      background: transparent;
      border-color: #d9d9d9;
      text-shadow: none;
    }
    .ant-btn-primary:hover, .ant-btn-primary:focus, .ant-btn-link:hover  {
      background-color: transparent;
    }
    .ant-btn-link > span {
      color:var(--blue);
    }
    .ant-btn-dangerous > span {
      color: red;
    }
    #menu-button {
      color:#fff;
      background:transparent;
      border:none;
      &:hover {
        color:var(--blue); 
      }
    }
    #menu-list li {
      padding-right: 3rem;
    }
    #menu-list .ant-dropdown-menu-item-disabled {
      display: none;
    }
    .ant-dropdown-menu-title-content {
      color:#fff;
      &:hover{
        color:var(--blue); 
      }
    }
    .ant-dropdown-menu-dark .ant-dropdown-menu-item-selected span:hover {
      color: #fff;
      background: #1890ff;
    }
    #platform-header {
      .ant-dropdown-menu-title-content {
        color: var(--black);
      }
    }
    #login-form .ant-btn-primary {
      width: 100%;
      padding-top:0.4rem;
      border:1px solid var(--light-grey);
    }
    #login-form .ant-col .ant-form-item-control-input {
      // id & password
      border:1px solid var(--light-grey);
      border-radius:10px;
    }
    #login-form .ant-input {
      font-size:1rem;
    }
    #login-form .ant-form-item-explain {
      height:2rem;
    }
    #login-form .ant-form-item-explain.ant-form-item-explain-error > div {
      font-size:0.6rem;
    }
    #advertising-add-form #new-button label{
      visibility:hidden;
    }
    #advertising-add-form .ant-input,  
    #advertising-add-form .ant-btn  {
      transition-property:none;
    }
    .ant-input-prefix{
      padding-right:0.2rem;
      color: var(--grey);
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s;
      -webkit-transition: background-color 9999s ease-out;
      -webkit-text-fill-color: var(--black) !important;
    }  
    .ant-picker-focused,
    .ant-picker:hover {
      border-color: var(--light-grey);
      box-shadow: none;
      cursor:pointer;
    }
    .ant-table-thead {
      text-transform: uppercase;
    }
    .ant-table-tbody .ant-table-cell-fix-left {
      cursor:pointer;
    }
    .ant-table-wrapper::-webkit-scrollbar {
      width: 20px;
    }
    #change-form,
    #change-form .ant-descriptions,
    #change-form table{
     height:100%;
    }
    #change-form .ant-descriptions-view {
     height:100%;
     overflow:auto;
    }
    #change-form .ant-descriptions-item-label {
      width:90px;
      min-width: 90px;
      height:100%;
      text-align:center;
    }
    #change-form .ant-descriptions-item-label span{
     font-size:0.9rem;
    }
    #change-form .ant-form-item {
      margin-bottom: 0;
    }
    #change-form .ant-descriptions-bordered .ant-descriptions-item-label, .ant-descriptions-bordered .ant-descriptions-item-content{
      padding:0.6rem;
    }
    #change-form .ant-descriptions-bordered .ant-descriptions-item-content, .ant-descriptions-bordered .ant-descriptions-item-label {
     overflow:auto;
    } 
    .ant-modal {
      padding:0;
    }
    #campaign-add-form .ant-form-item-label > label {
      font-size:1rem;
    }
    #infocard-image-form label {
      font-size: 0.8rem;
    }
    .ant-avatar > img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    } 
    #infocard-image-form img {
      border-radius:20px;
    }
    #infocard-image-form .ant-upload,
    #infocard-image-form .ant-upload:hover,
    #infocard-image-form .ant-upload:not(:hover) {
        border:none !important;
        background:transparent;
    }
    #dashboard-table.sticky tbody tr:last-child{
			border: 0;
		}
    #selectable-table .ant-table-thead > tr > th,
    #reserved-table .ant-table-thead > tr > th {
      display: none;
    }
    #selectable-table .ant-table-tbody > tr > td,
    #reserved-table .ant-table-tbody > tr > td {
      border-bottom: none;
    }
    .excel-modal .ant-modal-body,
    .table-modal .ant-modal-body {
      padding: 1rem;
    }
`;
export const Nav = styled.nav`
	display: flex;
	justify-content: space-between;
	@media (max-width: 630px) {
		flex-direction: column;
		margin-bottom: 1rem;
	}
`;
export const NavLeft = styled.div`
	display: flex;
	width: 100%;
	min-width: 300px;
`;
export const NavRight = styled.div`
	display: flex;
	margin-bottom: 1rem;
	@media (max-width: 630px) {
		margin-bottom: 0;
	}
`;
export const NavBtn = styled(Button)`
	width: 8.5rem;
`;
export const PaddingContainer = styled.div`
	padding: 0 15rem;
	@media (max-width: 1000px) {
		padding: 0 10rem;
	}
	@media (max-width: 800px) {
		padding: 0;
	}
`;
export const TableContainer = styled.div`
	overflow: auto;
`;
export const TableStyles = styled.div<{ height?: string }>`
	display: flex;
	flex-direction: column;
	height: 100%;
	max-height: ${props => props.height || '100%'}; // sticky header
	table {
		.ellipsis {
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
		.lineclamp {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
			text-align: center;
		}
		.tr {
			border-bottom: 1px solid var(--light-grey);
			:last-child {
				.td {
					border-bottom: 0;
				}
			}
			&:hover {
				background: #fdfdfd;
			}
		}
		.th,
		.td {
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			margin: 0;
			padding: 0.8rem;
			:last-child {
				border-right: 0;
			}
			.resizer {
				position: absolute;
				top: 9px;
				right: 0;
				width: 3px;
				height: 65%;
				background: var(--light-grey);
				z-index: 100;
				touch-action: none;
				&.isResizing {
					width: 5px;
				}
			}
		}
		.th {
			display: flex;
			justify-content: center;
			align-items: center;
			background: #fafafa;
			font-weight: bold;
			text-transform: uppercase;
		}
		tfoot {
			border-bottom: 0.1px solid var(--light-grey);
			font-weight: bold;
			&.sticky {
				position: sticky;
				bottom: 0;
				background: #fff;
				box-shadow: inset 0 1px 0 var(--light-grey);
			}
		}
		&.sticky {
			overflow: scroll;
			.header,
			thead {
				position: sticky;
				z-index: 100;
				top: 0;
			}
			.body,
			tbody {
				position: relative;
			}
		}

		.total {
			padding: 0.8rem;
			text-align: center;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.total.frozen {
			// 합계
			padding-left: 50%;
		}
	}
`;

export const StyledDataGrid = styled(DataGrid)`
	& .MuiDataGrid-columnHeaderTitle {
		line-height: 1.5;
		text-overflow: clip;
		text-align: center;
		white-space: pre-wrap;
	}
	& .MuiDataGrid-cellContent {
		border: 0;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		text-overflow: ellipsis;
		text-align: center;
		white-space: pre-wrap;
	}
`;

interface IProps {
	width?: string | null;
	borderRadius?: string | null;
}

export const DefaultImg = styled.img<IProps>`
	width: ${props => props.width};
	border-radius: ${props => props.borderRadius || '20px'};
	filter: grayscale(100%) brightness(120%);
`;

export default GlobalStyles;
