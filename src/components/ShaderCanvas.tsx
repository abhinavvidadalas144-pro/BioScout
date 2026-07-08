import { useEffect, useRef } from "react";

export default function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) {
      console.warn("WebGL not supported, falling back to CSS background animation");
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        
        // Fluid emerald forest organic flows
        float flow = sin(uv.x * 3.0 + u_time * 0.3) * cos(uv.y * 2.0 - u_time * 0.2);
        float flow2 = cos(uv.x * 2.0 - u_time * 0.25) * sin(uv.y * 3.5 + u_time * 0.4);
        
        // Color palette based on BioScout emerald/forest greens
        vec3 color1 = vec3(0.01, 0.18, 0.14); // Very Dark Forest
        vec3 color2 = vec3(0.02, 0.42, 0.29); // Emerald
        vec3 color3 = vec3(0.04, 0.28, 0.25); // Teal
        
        vec3 finalColor = mix(color1, color2, flow * 0.5 + 0.5);
        finalColor = mix(finalColor, color3, flow2 * 0.3 + 0.3);
        
        // Soft mouse highlight
        vec2 m = u_mouse / u_resolution;
        float dist = distance(uv, m);
        float highlight = smoothstep(0.4, 0.0, dist) * 0.12;
        finalColor += vec3(0.05, 0.6, 0.4) * highlight;
        
        // Soft vignette
        float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5));
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 0.85);
      }
    `;

    function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = rect.height - (e.clientY - rect.top);
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const render = (time: number) => {
      if (!canvasRef.current) return;
      
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 600;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform1f(uTime, time * 0.001);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-[#021f18] via-[#053d2d] to-[#042825]"
      style={{ display: "block" }}
    />
  );
}
