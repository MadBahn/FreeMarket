import "./App.scss";
import "./assets/iconfont.css";
import {useRoutes} from "react-router-dom";
import routes from "./router";
import zhCN from 'antd/locale/zh_CN';
import {ConfigProvider} from "antd";

function App() {
  const outlet = useRoutes(routes);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="App">
        { outlet }
      </div>
    </ConfigProvider>
  )
}

export default App
