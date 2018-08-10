from docx import Document
import re
import xml.etree.ElementTree as ET
import base64

def hasImage(para, doc_part):
    """get all of the images in a paragraph 
    :param par: a paragraph object from docx
    :return: a list of r:embed 
    """
    imgs = []
    root = ET.fromstring(para._p.xml)
    namespace = {
             'a':"http://schemas.openxmlformats.org/drawingml/2006/main", \
             'r':"http://schemas.openxmlformats.org/officeDocument/2006/relationships", \
             'wp':"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"}

    inlines = root.findall('.//wp:inline', namespace)
    for inline in inlines:
        imgs = inline.findall('.//a:blip', namespace)
    if imgs:
        rId = imgs[0].items()[0][-1]
        binImg = doc_part.related_parts[rId]._blob
        imgs[0] = '<img src="data:image/png;base64,' + str(base64.b64encode(binImg).decode("utf-8")) + '">'
    return imgs

def parse(doc):
    document = Document(doc)
    document_part = document.part
    regexps = {
        "question": ["Q[.)]", "QID"],
        "options": ["[A-P, a-p, 1-9][.)]"],
        "answers": ["Correct Answer", "Answer", "Ans"],
    }
    isQuestion = False
    isOption = False
    isFirstLine = False
    isAnswer = False
    """
        SCHEMA FOR test:

        test = {
            "Section 1": [
                {
                    "question": "",
                    "options": [],
                    "answers": [],
                    "explanation": "",
                },
            ],
            ...
        }
    """
    lastSection = ""
    test = {}
    for para in document.paragraphs:
        imgs = hasImage(para, document_part)
        # WARNING: repeated code
        if imgs:
            if isOption:
                if isFirstLine:
                    test[lastSection][-1]["options"].append([imgs[0], False, []])
                    isFirstLine = False
                else:
                    test[lastSection][-1]["options"][-1][0] += (" " + imgs[0])
            else:
                if not lastSection in test.keys():
                    test[lastSection] = []
                if isFirstLine:
                    test[lastSection].append({
                            "question": "",
                            "options": [],
                            "answers": [],
                            "explanation": "",
                        })
                if not isOption:
                    test[lastSection][-1]["question"] = test[lastSection][-1]["question"].strip() + " " + imgs[0]
                    isFirstLine = False
        for line in para.text.split("\n"):
            if "Options" in line:
                continue
            if not len(line.strip()):
                continue
            for regexp in regexps["question"]:
                if isQuestion:
                    break
                if re.match(regexp, line):
                    if not len(lastSection):
                        lastSection = "Section 1"
                    isQuestion, isOption, isFirstLine = True, False, True
                    isAnswer = False
                    break
            for regexp in regexps["options"]:
                if re.match(regexp, line):
                    isQuestion, isOption, isFirstLine = False, True, True
                    isAnswer = False
                    break
            for regexp in regexps["answers"]:
                if re.match(regexp, line):
                    isQuestion, isOption, isFirstLine = False, False, False
                    isAnswer = True
                    break
            if not isQuestion and not isOption and not isAnswer:
                lastSection = line.strip()

            if isQuestion:
                if not lastSection in test.keys():
                    test[lastSection] = []
                if isFirstLine:
                    test[lastSection].append({
                            "question": "",
                            "options": [],
                            "answers": [],
                            "explanation": "",
                        })
                if not isOption:
                    test[lastSection][-1]["question"] = test[lastSection][-1]["question"].strip() + " " + line.strip()
                    isFirstLine = False

            if isOption:
                if isFirstLine:
                    test[lastSection][-1]["options"].append([line.strip(), False, []])
                    isFirstLine = False
                else:
                    test[lastSection][-1]["options"][-1][0] += (" " + line.strip())

            if isAnswer:
                answers = line.split()[-1]
                for answer in answers.split(","):
                    test[lastSection][-1]["answers"].append(answer)
                    for i in range(len(test[lastSection][-1]["options"])):
                        optionText = test[lastSection][-1]["options"][i][0]
                        isCorrect = True if re.match(answer, optionText) else False
                        test[lastSection][-1]["options"][i][1] = isCorrect
                        optionText = " ".join(optionText.split()[1:])
                        test[lastSection][-1]["options"][i][0] = optionText
                isAnswer = False
    return test
