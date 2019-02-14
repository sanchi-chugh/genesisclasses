from bs4 import BeautifulSoup
import re
import os
import subprocess
from pynliner import Pynliner
from test_series import settings

class Parser():
    def __init__(self, slice_filepath ):
        self.directory = slice_filepath

    def get_html(self):
        folder_path = self.directory.replace('.docx', '')
        html_file_name = folder_path.split('/')[-1].replace('docs/', '') + '.html'

        os.makedirs(folder_path)    # Make folder in media/docs/ for html file and media file

        # Extract html and media files in mathjax format
        p = subprocess.Popen(
            "pandoc --extract-media {} {} -s --mathjax -o {}/{}".format(
                folder_path, self.directory, folder_path, html_file_name),
            stdout=subprocess.PIPE, shell=True)
        (_, _) = p.communicate()

        # See if the file exists, if yes, return the files path
        for _, _, files in os.walk(settings.MEDIA_ROOT):
            if html_file_name in files:
                return folder_path + '/' + html_file_name

        return None

    def parse(self):
        html_path = self.get_html()     # Convert docx to html format
        if not html_path:   # If some error in extracting
            return None

        html_doc  = Pynliner().from_string(open(html_path, encoding="utf8").read()).run()
        soup = BeautifulSoup(html_doc, 'html.parser')

        # Change image urls to absolute urls
        for img in soup.find_all('img'):
            try:
                img['src'] = settings.DOMAIN + img['src'].replace(settings.MEDIA_ROOT, 'media')
            except:
                continue

        body = soup.body
        paragraphs = body.contents

        isPassage = False
        isQuestionType = False
        isQuestion = False
        isOption = False
        isExplanation = False
        isMarks = False
        isNegative = False
        isCorrectAnswer = False
        optionCount = 0
        regexps = {
                "section": [re.compile("Section:", re.IGNORECASE)],
                "passage":[re.compile(r"[PTQ]+[:.,-]" , re.IGNORECASE)],
                "question": [re.compile(r"[Q^Question^QID]+\d+[:.,]\s", re.IGNORECASE)],
                "questionType":[re.compile("Question Type:", re.IGNORECASE), re.compile("qstntype:", re.IGNORECASE)],
                "options": [re.compile(r"[1-9][\.)>]\s?", re.IGNORECASE)],
                "answers": [
                    re.compile("Correct Answer:", re.IGNORECASE),
                    re.compile("Answer:", re.IGNORECASE),
                    re.compile("Ans:", re.IGNORECASE),
                ],
                "marks": [re.compile("Marks:", re.IGNORECASE)],
                "negative": [re.compile("Negative:", re.IGNORECASE)],
                "explanation": [re.compile("Explanation:", re.IGNORECASE)],
            }

        test = {}
        questionBufferText = ''
        questionBufferFlushed = True

        passageBufferText = ''
        passageBufferFlushed = True

        questionTypeBufferText = ''
        questionTypeBufferFlushed = True

        optionBufferText = ''
        optionBufferFlushed = True

        answerBufferText = ''
        answerBufferFlushed = True

        marksBufferText = ''
        marksBufferFlushed = True

        negativeBufferText = ''
        negativeBufferFlushed = True

        explanationBufferText = ''
        explanationBufferFlushed = True

        message_arr = []

        # Represent index
        quesCount = -1
        sectionCount = -1
        passageCount = -1
        ongoingPassage = -1

        # Represent number
        totalQuesCount = 0

        test['sections'] = []
        try:
            for para in paragraphs:
                if para == '\n':
                    continue
                line = para.get_text().strip()
                for regexp in regexps["section"]:
                    if re.match(regexp, line):
                        if sectionCount >= 0:
                            if explanationBufferFlushed == False:
                                explanationBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['explanation'] = explanationBufferText
                                explanationBufferText = ''
                            else:
                                # Show error if previous question's explanation is missing
                                msg = 'Explanation not found at ' + str(totalQuesCount)
                                if msg not in message_arr:
                                    try:
                                        x = test['sections'][sectionCount]['questions'][quesCount]  # Index Error here
                                        if 'explanation' in test['sections'][sectionCount]['questions'][quesCount]:
                                            totalQuesCount += 1
                                            quesCount += 1
                                            test['sections'][sectionCount]['questions'].append({'question':''})
                                            message_arr.append('Question not found at ' + str(totalQuesCount))
                                        else:
                                            x['explanation'] = ''
                                        if 'questionType' not in x:
                                            # Reset question type buffer if answer key was also missing
                                            x['questionType'] = questionTypeBufferText
                                            questionTypeBufferText = ''
                                            questionTypeBufferFlushed = True
                                        if 'answer' not in x:
                                            # Reset answer buffer if marks key was also missing
                                            x['answer'] = answerBufferText
                                            answerBufferText = ''
                                            answerBufferFlushed = True
                                        if 'marks' not in x:
                                            # Reset marks buffer
                                            x['marks'] = marksBufferText
                                            marksBufferText = ''
                                            marksBufferFlushed = True
                                        # Reset negative marks buffer
                                        x['negative'] = ''
                                        negativeBufferText = ''
                                        negativeBufferFlushed = True
                                    except IndexError:
                                        test['sections'][sectionCount]['questions'].append({'question':questionBufferText})
                                        questionBufferText = ''
                                        questionBufferFlushed = True
                                        test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                                        optionBufferFlushed = True
                                        test['sections'][sectionCount]['questions'][quesCount]['answer'] = answerBufferText
                                        answerBufferText = ''
                                        answerBufferFlushed = True
                                        test['sections'][sectionCount]['questions'][quesCount]['marks'] = ''
                                        marksBufferText = ''
                                        marksBufferFlushed = True
                                        test['sections'][sectionCount]['questions'][quesCount]['negative'] = ''
                                        negativeBufferText = ''
                                        negativeBufferFlushed = True
                                        test['sections'][sectionCount]['questions'][quesCount]['explanation'] = ''
                                    message_arr.append('Explanation not found at ' + str(totalQuesCount))
                        sectionCount += 1
                        quesCount = -1
                        passageCount = -1
                        ongoingPassage = -1
                        test['sections'].append({
                            'section': line
                        })
                        test['sections'][sectionCount]['passages'] = []
                        test['sections'][sectionCount]['questions'] = []
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, False, False, False, False, False, False)
                        continue

                for regexp in regexps["passage"]:
                    if re.match(regexp, line):
                        if explanationBufferFlushed == False:
                            explanationBufferFlushed = True
                            test['sections'][sectionCount]['questions'][quesCount]['explanation'] = explanationBufferText
                            explanationBufferText = ''
                        elif explanationBufferFlushed == True and quesCount > -1:
                            # Show error if previous question's explanation is not present
                            msg = 'Explanation not found at ' + str(totalQuesCount)
                            if msg not in message_arr:
                                try:
                                    x = test['sections'][sectionCount]['questions'][quesCount]  # IndexError here
                                    if 'explanation' in test['sections'][sectionCount]['questions'][quesCount]:
                                        totalQuesCount += 1
                                        quesCount += 1
                                        test['sections'][sectionCount]['questions'].append({'question':''})
                                        message_arr.append('Question not found at ' + str(totalQuesCount))
                                    else:
                                        x['explanation'] = ''
                                    if 'questionType' not in x:
                                        # Reset question type buffer if answer key was also missing
                                        x['questionType'] = questionTypeBufferText
                                        questionTypeBufferText = ''
                                        questionTypeBufferFlushed = True
                                    if 'answer' not in x:
                                        # Reset answer buffer if marks key was also missing
                                        x['answer'] = answerBufferText
                                        answerBufferText = ''
                                        answerBufferFlushed = True
                                    if 'marks' not in x:
                                        # Reset marks buffer
                                        x['marks'] = marksBufferText
                                        marksBufferText = ''
                                        marksBufferFlushed = True
                                    # Reset negative marks buffer
                                    x['negative'] = ''
                                    negativeBufferText = ''
                                    negativeBufferFlushed = True
                                except IndexError:
                                    test['sections'][sectionCount]['questions'].append({'question':questionBufferText})
                                    questionBufferText = ''
                                    questionBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                                    optionBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['answer'] = answerBufferText
                                    answerBufferText = ''
                                    answerBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['marks'] = ''
                                    marksBufferText = ''
                                    marksBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['negative'] = ''
                                    negativeBufferText = ''
                                    negativeBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['explanation'] = ''
                                message_arr.append('Explanation not found at ' + str(totalQuesCount))
                        passageBufferText = ''
                        passageBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, False, False, False, False, True, False)
                        passageCount += 1
                        continue

                for regexp in regexps["question"]:
                    if re.match(regexp, line):
                        if explanationBufferFlushed == False:
                            explanationBufferFlushed = True
                            test['sections'][sectionCount]['questions'][quesCount]['explanation'] = explanationBufferText
                            explanationBufferText = ''
                        elif explanationBufferFlushed == True and quesCount > -1 and passageBufferFlushed == True:
                            # Show error if previous question's explanation is not present
                            msg = 'Explanation not found at ' + str(totalQuesCount)
                            if msg not in message_arr:
                                try:
                                    x = test['sections'][sectionCount]['questions'][quesCount]
                                    if 'explanation' in test['sections'][sectionCount]['questions'][quesCount]:
                                        totalQuesCount += 1
                                        quesCount += 1
                                        test['sections'][sectionCount]['questions'].append({'question':''})
                                        message_arr.append('Question not found at ' + str(totalQuesCount))
                                    else:
                                        x['explanation'] = ''
                                    if 'questionType' not in x:
                                        # Reset question type buffer if answer key was also missing
                                        x['questionType'] = questionTypeBufferText
                                        questionTypeBufferText = ''
                                        questionTypeBufferFlushed = True
                                    if 'answer' not in x:
                                        # Reset answer buffer if marks key was also missing
                                        x['answer'] = answerBufferText
                                        answerBufferText = ''
                                        answerBufferFlushed = True
                                    if 'marks' not in x:
                                        # Reset marks buffer
                                        x['marks'] = marksBufferText
                                        marksBufferText = ''
                                        marksBufferFlushed = True
                                    # Reset negative marks buffer
                                    x['negative'] = ''
                                    negativeBufferText = ''
                                    negativeBufferFlushed = True
                                except IndexError:
                                    test['sections'][sectionCount]['questions'].append({'question':questionBufferText})
                                    questionBufferText = ''
                                    questionBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                                    optionBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['answer'] = answerBufferText
                                    answerBufferText = ''
                                    answerBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['marks'] = ''
                                    marksBufferText = ''
                                    marksBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['negative'] = ''
                                    negativeBufferText = ''
                                    negativeBufferFlushed = True
                                    test['sections'][sectionCount]['questions'][quesCount]['explanation'] = ''
                                message_arr.append('Explanation not found at ' + str(totalQuesCount))
                        questionBufferText = ''
                        questionBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            True, False, False, False, False, False, False, False)
                        quesCount += 1
                        totalQuesCount += 1
                        optionCount = 0
                        continue

                for regexp in regexps["options"]:
                    if re.match(regexp, line):
                        optionCount += 1
                        optionBufferFlushed = False
                        if optionCount == 2:
                            test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                            test['sections'][sectionCount]['questions'][quesCount]['options'].append(optionBufferText)
                            optionBufferText = ''

                        elif optionCount > 2:
                            test['sections'][sectionCount]['questions'][quesCount]['options'].append(optionBufferText)
                            optionBufferText = ''

                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, True, False, False, False, False, False, False)

                for regexp in regexps["answers"]:
                    if re.match(regexp, line):
                        answerBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, True, False, False, False, False, False)
                        continue

                for regexp in regexps["marks"]:
                    if re.match(regexp, line):
                        marksBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, False, False, True, False, False, False)
                        continue

                for regexp in regexps["questionType"]:
                    if re.match(regexp, line):
                        questionTypeBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, False, False, False, False, False, True)
                        continue

                for regexp in regexps["negative"]:
                    if re.match(regexp, line):
                        negativeBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, False, False, False, True, False, False)
                        continue

                for regexp in regexps["explanation"]:
                    if re.match(regexp, line):
                        explanationBufferFlushed = False
                        isQuestion, isOption, isCorrectAnswer, isExplanation, isMarks, isNegative, isPassage, isQuestionType = (
                            False, False, False, True, False, False, False, False)
                        continue

                if isPassage:
                    if passageBufferFlushed == False:
                        match = re.match(regexps['passage'][0], line)
                        if match:
                            line = line[match.end():]
                        passageBufferText = passageBufferText + ' ' + str(para)

                if isQuestion:
                    if passageBufferFlushed == False:
                        passageBufferFlushed = True
                        test['sections'][sectionCount]['passages'].append(passageBufferText)
                        ongoingPassage = passageCount   # Set ongoing passage as the current passage index
                        passageBufferText = ''
                    if questionBufferFlushed == False:
                        match = re.match(regexps['question'][0], line)
                        if match:
                            line = line[match.end():]
                        questionBufferText = questionBufferText + ' ' + str(para)

                if isOption:
                    if questionBufferFlushed == True and explanationBufferFlushed == False and questionBufferText == '':
                        msg = 'Question not found at ' + str(totalQuesCount)
                        # If question is not found
                        if msg not in message_arr:
                            totalQuesCount += 1
                            quesCount += 1
                            message_arr.append('Question not found at ' + str(totalQuesCount))
                            test['sections'][sectionCount]['questions'].append({'question': ''})
                            test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                    elif questionBufferFlushed == False:
                        questionBufferFlushed = True
                        test['sections'][sectionCount]['questions'].append({'question': questionBufferText})
                        test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                        questionBufferText = ''
                    if optionBufferFlushed == False:
                        match = re.match(regexps['options'][0], line)
                        if match:
                            line = line[match.end():]
                        optionBufferText = optionBufferText + ' ' + str(para)

                if isQuestionType:
                    if questionBufferFlushed == True and optionBufferFlushed == True and questionBufferText == '':
                        # Error if current question is not found
                        msg = 'Question not found at ' + str(totalQuesCount)
                        if msg not in message_arr:
                            totalQuesCount += 1
                            quesCount += 1
                            message_arr.append('Question not found at ' + str(totalQuesCount))
                            test['sections'][sectionCount]['questions'].append({'question': ''})
                            test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                    if questionBufferFlushed == False:
                        # If question is found but question buffer is not flushed yet
                        questionBufferFlushed =  True
                        test['sections'][sectionCount]['questions'].append({'question':questionBufferText})
                        questionBufferText = ''
                        test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                        # Option not provided Case:
                        test['sections'][sectionCount]['questions'][quesCount]['options'].append("1")
                        test['sections'][sectionCount]['questions'][quesCount]['options'].append("2")
                        test['sections'][sectionCount]['questions'][quesCount]['options'].append("3")
                        test['sections'][sectionCount]['questions'][quesCount]['options'].append("4")
                        optionBufferFlushed = True
                    elif optionBufferFlushed == False:
                        optionBufferFlushed = True
                        test['sections'][sectionCount]['questions'][quesCount]['options'].append(optionBufferText)
                        optionBufferText = ''
                    if len(line) and questionTypeBufferFlushed == False:
                        for regexp in regexps['questionType']:
                            match = re.match(regexp, line)
                            if match:
                                line = line[match.end():]
                        questionTypeBufferText = questionTypeBufferText + ' ' +line
                        questionTypeBufferText = questionTypeBufferText.strip()
    
                if isCorrectAnswer:
                    if questionTypeBufferFlushed == True and questionTypeBufferText == '':
                        # Error if question type is not found
                        msg = 'Question Type not found at ' + str(totalQuesCount)
                        if msg not in message_arr:
                            message_arr.append('Question Type not found at ' + str(totalQuesCount))
                        try:
                            test['sections'][sectionCount]['questions'][quesCount]['questionType'] = ''
                        except IndexError:
                            # If question buffer is not flushed, which means
                            # all keys before question type were not present for this question.
                            test['sections'][sectionCount]['questions'].append({'question': questionBufferText})
                            questionBufferText = ''
                            questionBufferFlushed = True
                            test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                            optionBufferFlushed = True
                            test['sections'][sectionCount]['questions'][quesCount]['questionType'] = ''
                    elif questionTypeBufferFlushed == False:
                        questionTypeBufferFlushed = True
                        # Error if question type is not one of the required question types
                        questionTypeBufferText = questionTypeBufferText.strip()
                        if questionTypeBufferText not in ('mcq', 'scq', 'integer', 'passage'):
                            message_arr.append('Question Type error at ' + str(totalQuesCount) + '.' +
                                ' Question type must be one of (mcq, scq, integer, passage)')
                            test['sections'][sectionCount]['questions'][quesCount]['questionType'] = ''
                        else:
                            test['sections'][sectionCount]['questions'][quesCount]['questionType'] = questionTypeBufferText
                        # Passage type questions must have a passage
                        if questionTypeBufferText == 'passage':
                            if ongoingPassage == -1:
                                # Error if no passage is present for a passage type question
                                message_arr.append('Passage not present for passage type question ' + str(totalQuesCount) + '. ' +
                                    'Remember to use keyword "PTQ:" before passage. Please keep at least one line gap before keyword "PTQ:".')
                            test['sections'][sectionCount]['questions'][quesCount]['passage'] = ongoingPassage
                        else:
                            ongoingPassage = -1
                        # Integer questions must not have options
                        if questionTypeBufferText == 'integer':
                            test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                        questionTypeBufferText = ''
                    if len(line) and answerBufferFlushed == False:
                        for regexp in regexps['answers']:
                            match = re.match(regexp, line)
                            if match:
                                line = line[match.end():]
                        answerBufferText = answerBufferText + ' ' +line
                        answerBufferText = answerBufferText.strip()

                if isMarks:
                    if answerBufferFlushed == True and answerBufferText == '':
                        # Error if correct answer is not found
                        msg = 'Answer not found at ' + str(totalQuesCount)
                        if msg not in message_arr:
                            try:
                                x = test['sections'][sectionCount]['questions'][quesCount]    # Index Error here
                                if 'answer' in test['sections'][sectionCount]['questions'][quesCount]:
                                    # This is the case when answer was already present
                                    # which means current question is missing
                                    totalQuesCount += 1
                                    quesCount += 1
                                    test['sections'][sectionCount]['questions'].append({'question': ''})
                                    message_arr.append('Question not found at ' + str(totalQuesCount))
                                else:
                                    x['answer'] = ''
                                # Reset question type buffer
                                x['questionType'] = questionTypeBufferText
                                questionTypeBufferText = ''
                                questionTypeBufferFlushed = True
                            except IndexError:
                                # If question buffer is not flushed, which means
                                # all keys before marks were not present for this question.
                                test['sections'][sectionCount]['questions'].append({'question': questionBufferText})
                                questionBufferText = ''
                                questionBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                                optionBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['questionType'] = questionTypeBufferText
                                questionTypeBufferText = ''
                                questionTypeBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['answer'] = []
                            message_arr.append('Answer not found at ' + str(totalQuesCount))
                    elif answerBufferFlushed == False:
                        # Check if answer is comma separated integers of correct answers or not
                        answerBufferFlushed = True
                        answersArr = answerBufferText.split(',')
                        answerError = False
                        try:
                            integralAnswers = [int(ans) for ans in answersArr]
                        except ValueError:
                            message_arr.append('Answer error at ' + str(totalQuesCount) + '.' +
                                ' Answer must be comma separated integral values of options.')
                            answerError = True
                        # Error if no answer is present
                        if not len(integralAnswers) and not answerError:
                            message_arr.append('Answer error at ' + str(totalQuesCount) + '.' +
                                ' There must be at least one correct answer.')
                        # Error if answer crosses option values (e.g. answer is 5 whereas options are till 4 only)
                        questionType = test['sections'][sectionCount]['questions'][quesCount]['questionType']
                        if not answerError and questionType and questionType != 'integer':
                            optionsLength = len(test['sections'][sectionCount]['questions'][quesCount]['options'])
                            for ans in integralAnswers:
                                if ans > optionsLength:
                                    message_arr.append('Answer error at ' + str(totalQuesCount) + '.' +
                                        ' One of the provided options in the answer does not exist.')
                                    answerError = True
                                    break
                        # Error if more than one correct answer in passage, scq and integer
                        if not answerError and questionType:
                            if len(integralAnswers) > 1 and questionType in ('passage', 'scq', 'integer'):
                                message_arr.append('Answer error at ' + str(totalQuesCount) + '.' +
                                    ' There must be only one correct answer in case of passage type questions, ' +
                                    'single choice questions (scq) and integer type questions.')
                                answerError = True
                            if questionType == 'integer' and integralAnswers[0] not in range(0, 10) and not answerError:
                                # If question type is integer, then only 0-9 ans is allowed
                                message_arr.append('Answer error at ' + str(totalQuesCount) + '.' +
                                    ' Integer answer must be between 0 to 9.')
                                answerError = True
                        if not answerError:
                            test['sections'][sectionCount]['questions'][quesCount]['answer'] = integralAnswers
                        else:
                            test['sections'][sectionCount]['questions'][quesCount]['answer'] = []
                        answerBufferText = ''
                    if marksBufferFlushed == False:
                        for regexp in regexps['marks']:
                            match = re.match(regexp, line)
                            if match:
                                line = line[match.end():]
                        marksBufferText = marksBufferText + ' ' + line

                if isNegative:
                    if marksBufferFlushed == True and marksBufferText == '':
                        # Error if marks key is not found
                        msg = 'Marks not found at ' + str(totalQuesCount)
                        if msg not in message_arr:
                            try:
                                x = test['sections'][sectionCount]['questions'][quesCount]  # IndexError here
                                if 'marks' in test['sections'][sectionCount]['questions'][quesCount]:
                                    # This is the case when marks were already present
                                    # which means current question is missing
                                    totalQuesCount += 1
                                    quesCount += 1
                                    test['sections'][sectionCount]['questions'].append({'question':''})
                                    message_arr.append('Question not found at ' + str(totalQuesCount))
                                else:
                                    x['marks'] = ''
                                if 'questionType' not in x:
                                    # Reset question type buffer if answer key was also missing
                                    x['questionType'] = questionTypeBufferText
                                    questionTypeBufferText = ''
                                    questionTypeBufferFlushed = True
                                # Reset answer buffer
                                x['answer'] = answerBufferText
                                answerBufferText = ''
                                answerBufferFlushed = True
                            except IndexError:
                                # This is the case when new question was encountered but question buffer is not
                                # flushed yet. This means all keys before marks were missing in this question.
                                test['sections'][sectionCount]['questions'].append({'question':questionBufferText})
                                questionBufferText = ''
                                questionBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                                optionBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['questionType'] = questionTypeBufferText
                                questionTypeBufferText = ''
                                questionTypeBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['answer'] = answerBufferText
                                answerBufferText = ''
                                answerBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['marks'] = ''
                            message_arr.append('Marks not found at ' + str(totalQuesCount))
                    elif marksBufferFlushed == False:
                        # Error if marks is not float value
                        marksBufferFlushed = True
                        try:
                            marksFloat = float(marksBufferText)
                            test['sections'][sectionCount]['questions'][quesCount]['marks'] = marksFloat
                        except ValueError:
                            message_arr.append('Marks error encountered at ' + str(totalQuesCount) + '.' +
                                ' Marks must be an integral or decimal value, not string.')
                            test['sections'][sectionCount]['questions'][quesCount]['marks'] = ''
                        marksBufferText = ''
                    if len(line) and negativeBufferFlushed == False:
                        for regexp in regexps['negative']:
                            match = re.match(regexp, line)
                            if match:
                                line = line[match.end():]
                        negativeBufferText = negativeBufferText + ' ' +line

                if isExplanation:
                    if negativeBufferFlushed == True and negativeBufferText == '' and explanationBufferText == '':
                        # Error if negative marks are not present
                        msg = 'Negative marks not found at ' + str(totalQuesCount)
                        if msg not in message_arr:
                            try:
                                x = test['sections'][sectionCount]['questions'][quesCount]  # IndexError here
                                if 'negative' in test['sections'][sectionCount]['questions'][quesCount]:
                                    # This is the case when negative marks were already present
                                    # That means current question is missing
                                    totalQuesCount += 1
                                    quesCount += 1
                                    test['sections'][sectionCount]['questions'].append({'question':''})
                                    message_arr.append('Question not found at ' + str(totalQuesCount))
                                else:
                                    x['negative'] = ''
                                    if 'questionType' not in x:
                                        # Reset question type buffer if answer key was also missing
                                        x['questionType'] = questionTypeBufferText
                                        questionTypeBufferText = ''
                                        questionTypeBufferFlushed = True
                                    if 'answer' not in x:
                                        # Reset answer buffer if marks key was also missing
                                        x['answer'] = answerBufferText
                                        answerBufferText = ''
                                        answerBufferFlushed = True
                                    # Reset marks buffer
                                    x['marks'] = marksBufferText
                                    marksBufferText = ''
                                    marksBufferFlushed = True
                            except IndexError:
                                # This is the case when new question was encountered but question buffer is not
                                # flushed yet. This means all keys before negative were missing in this question.
                                test['sections'][sectionCount]['questions'].append({'question': questionBufferText})
                                questionBufferText = ''
                                questionBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['options'] = []
                                optionBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['questionType'] = questionTypeBufferText
                                questionTypeBufferText = ''
                                questionTypeBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['answer'] = answerBufferText
                                answerBufferText = ''
                                answerBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['marks'] = marksBufferText
                                marksBufferText = ''
                                marksBufferFlushed = True
                                test['sections'][sectionCount]['questions'][quesCount]['negative'] = ''
                            message_arr.append('Negative marks not found at ' + str(totalQuesCount))
                    if negativeBufferFlushed == False:
                        # Error if negative marks is not float value
                        negativeBufferFlushed = True
                        try:
                            negativeMarksFloat = float(negativeBufferText)
                            test['sections'][sectionCount]['questions'][quesCount]['negative'] = negativeMarksFloat
                        except ValueError:
                            message_arr.append('Negative marks error at ' + str(totalQuesCount) + '.' +
                                ' Negative Marks must be an integral or decimal value, not string.')
                            test['sections'][sectionCount]['questions'][quesCount]['negative'] = ''
                        negativeBufferText = ''
                    if len(line) and explanationBufferFlushed == False:
                        match = re.match(regexps['explanation'][0], line)
                        if match:
                            line = line[match.end():]
                        explanationBufferText = explanationBufferText + ' ' + str(para)

            if explanationBufferFlushed == False:
                explanationBufferFlushed = True
                test['sections'][sectionCount]['questions'][quesCount]['explanation'] = explanationBufferText
                explanationBufferText = ''
            else:
                msg = 'Explanation is not found at ' + str(totalQuesCount) + ' (last question).'
                message_arr.append(msg)
    
        except Exception:
            if sectionCount == -1:
                msg = 'This doc contains NO sections. Adding at least one section is compulsory. (Use "Section: section name")'
            else:
                msg = "Document Rules not satisfied near Question No." + str(totalQuesCount) + " Section: " + str(sectionCount + 1)
            return {
                    "status" : "error",
                    "message" : [msg,],
                    "test": test
                }

        if len(message_arr) > 0:
            # If doc format is incorrect, return error msgs
            return {
                "status" : "error",
                "message" : message_arr,
                "test": test
            }

        return {
            "status" : "success",
            "message" : "Document Parsed",
            "test": test
        }

