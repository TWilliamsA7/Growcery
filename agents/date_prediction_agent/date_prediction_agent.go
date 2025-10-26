package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type RPCRequest struct {
    JSONRPC string                 `json:"jsonrpc"`
    Method  string                 `json:"method"`
    Params  map[string]interface{} `json:"data"`
    ID      int                    `json:"id"`
}

type RPCResponse struct {
    JSONRPC string      `json:"jsonrpc"`
    ID      int         `json:"id"`
    Result  interface{} `json:"result,omitempty"`
    Error   interface{} `json:"error,omitempty"`
}

func datePredictionHandler(w http.ResponseWriter, r *http.Request) {
    var req RPCRequest

    // Decode the incoming JSON
    err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        fmt.Println("Failed to decode request:", err)
        return
    }

    fmt.Println("Received method:", req.Method)

    // Handle the method
    switch req.Method {
        case "farmer":
            prompt := fmt.Sprintf("%s %s %s", req.Params["location"], req.Params["name"], req.Params["attributes"]) // location, crop name, attributes
            response := RPCResponse{
                JSONRPC: "2.0",
                ID:      req.ID,
                Result:  prompt,
            }
            json.NewEncoder(w).Encode(response)

        case "consumer":
    }

    // Unknown method fallback
    response := RPCResponse{
        JSONRPC: "2.0",
        ID:      req.ID,
        Error:   "Unknown method",
    }
    json.NewEncoder(w).Encode(response)
}

func main() {
    http.HandleFunc("/rpc", datePredictionHandler)
    fmt.Println("Starting server on port 8006...")
    http.ListenAndServe(":8006", nil)
}