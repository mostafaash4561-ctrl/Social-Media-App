import { TailSpin } from "react-loader-spinner";

export default function Loader() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <TailSpin
        visible={true}
        height="100"
        width="100"
        color="#4A43C9"
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
}
