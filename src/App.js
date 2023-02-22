import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [imgURLS, setImgURLS] = useState([]);

  useEffect(()=>{
    fetch('https://jsonplaceholder.typicode.com/photos')
      .then((res)=> res.json())
      .then((value)=>setImgURLS(value));
  }, []);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        imgURL: imgURLS[Math.floor(Math.random() * imgURLS.length)].url,
        updateEnd: true
      },
    ]);
  };

  const removeMoveable = () => {
  
    function removeValue(value, index, arr) {
      if (value.id === selected) {arr.splice(index, 1)}
    }
  
    moveableComponents.filter(removeValue);
    setSelected(0);
  }

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main className= 'main' style={{ height : "100vh", width: "100vw" }}>
      <h1 className="title">Moveable Components!</h1>
      <div className="buttonContainer">
        <button className="button" onClick={addMoveable}>Add Moveable</button>
        <button className="button" onClick={removeMoveable}>Remove Selected Moveable</button>
      </div>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  imgURL,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    imgURL,
    id,
  });

  const [globalTranslateX, setGlobalTranslateX] = useState(0);
  const [globalTranslateY, setGlobalTranslateY] = useState(0);


  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      imgURL,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    setGlobalTranslateX(translateX);
    setGlobalTranslateY(translateY);


    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const absoluteTop = top ;
    const absoluteLeft = left;

    updateMoveable(id, {
      top: absoluteTop,
      left: absoluteLeft,
      width: newWidth,
      height: newHeight,
      imgURL,
    }, true);
  };


  //Función para hacer el handle del drag
  const onDrag = (e) => {
  
    const parentHeight= e.currentTarget._prevTarget.offsetParent.clientHeight;
    const parentWidth= e.currentTarget._prevTarget.offsetParent.clientWidth;

    let newTop = -globalTranslateY;
    let newLeft = -globalTranslateX;

    if (e.top > -globalTranslateY) {newTop= e.top};
    if (e.bottom < globalTranslateY) {newTop= parentHeight - e.height - globalTranslateY}
    if (e.left > -globalTranslateX) {newLeft= e.left};
    if (e.right < globalTranslateX) {newLeft= parentWidth - e.width - globalTranslateX}


    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width,
      height,
      imgURL,
    });
  }

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${imgURL})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'

        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={onDrag}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
