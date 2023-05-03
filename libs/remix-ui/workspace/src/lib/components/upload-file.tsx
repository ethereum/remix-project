import React, { useEffect, useRef } from "react";

type UploadFileProps = {
  onUpload: (target: EventTarget & HTMLInputElement, files?: FileList) => void;
  accept?: string;
  multiple?: boolean;
};

const UploadFile = (props: UploadFileProps) => {
  const ref = useRef<HTMLInputElement>();

  useEffect(() => {
    ref.current.click();
    ref.current.onchange= (event)=>{
        //@ts-ignore
        props.onUpload(event.target, event.target.files);
    }
  }, []);

  return (
    <input
      ref={ref}
      style={{ display: "none" }}
      accept={props.accept}
      multiple={props.multiple}
      type="file"
    />
  );
};

export default UploadFile;
