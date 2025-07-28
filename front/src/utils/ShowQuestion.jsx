import { Card } from "reactstrap";

export function ShowQuestion(params) {
    return (
        <div className="align-content-center h-100">
            <div className="mx-auto" style={{width:"fit-content"}}>
                <Card className="gap-4 align-items-center" style={{backgroundColor:"rgb(74, 81, 117)", color:"white", fontWeight: "bold"}}>
                    <div className="fs-2">
                        {params.question}
                    </div>
                    {params.type == "image" &&
                        <img src={params.image} style={{
                            borderRadius:"10px",
                            maxWidth:"700px",
                            objectFit: "cover",
                            width:"70vw" 
                        }}/>
                    }
                </Card>
            </div>
        </div>
    )
}